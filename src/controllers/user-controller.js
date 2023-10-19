const prisma = require("../models/prisma")
const selectCategory = require("../models/selectCategory")
const { uploadToCloud } = require("../utils/cloudinary-service")
const { checkUserIdSchema } = require('../validators/user-validator')

exports.updateProfile = async (req, res, next) => {
    try {
        const { description, category, interest } = req.body

        const updateObj = {}
        let userProfileUpdate

        if (description) {
            console.log("🚀 ~ file: user-controller.js:14 ~ exports.updateProfile= ~ description:", description)
            updateObj.description = description
        }

        if (req.file) {
            console.log("🚀 ~ file: user-controller.js:19 ~ exports.updateProfile= ~ req.file:", req.file)
            updateObj.profileImage = await uploadToCloud(req.file.path)
        }

        if (Object.keys(updateObj).length !== 0) {
            console.log("🚀 ~ file: user-controller.js:26 ~ exports.updateProfile= ~ updateObj:", updateObj)
            console.log("🚀 ~ file: user-controller.js:24 ~ exports.updateProfile= ~ Object.keys(updateObj).length:", Object.keys(updateObj).length)
            const userData = await prisma.user.update({
                data: {
                    ...updateObj
                },
                where: {
                    id: req.user.id
                }
            })
            userProfileUpdate = userData
        }

        userProfileUpdate.category = await Promise.resolve(selectCategory(req.user.id, category, "userCategory"))
        userProfileUpdate.interest = await Promise.resolve(selectCategory(req.user.id, interest, "userInterest"))

        delete userProfileUpdate.password

        res.status(200).json(userProfileUpdate)
    } catch (err) {
        next(err)
    }
}


exports.getUserById = async (req, res, next) => {
    try {
        const { error } = checkUserIdSchema.validate(req.params)
        if (error) {
            return next(error)
        }
        const userId = +req.params.userId;
        const profile = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                userCategorys: {
                    select: {
                        categoryName: true
                    }
                },
                userInterests: {
                    select: {
                        categoryName: true
                    }
                },
                posts: true,
                // event: true,
                joinEvents: true,
            }
        })

        delete profile.password
        console.log(profile)
        res.status(200).json(profile)
    } catch (err) {
        next(err)
    }
}