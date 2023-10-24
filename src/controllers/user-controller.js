const prisma = require("../models/prisma")
const selectCategory = require("../models/selectCategory")
const { uploadToCloud } = require("../utils/cloudinary-service")
const { checkUserIdSchema } = require('../validators/user-validator')

exports.updateProfile = async (req, res, next) => {
    try {
        const { description, category, interest } = req.body

        const updateObj = {}

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
        }

        const userProfileUpdate = await prisma.user.findUnique({
            where: {
                id: req.user.id
            }
        })

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
            console.log("🚀 ~ file: user-controller.js:57 ~ exports.getUserById= ~ error:", error)
            return next(error)
        }
        const userId = +req.params.userId;
        console.log("🚀 ~ file: user-controller.js:60 ~ exports.getUserById= ~ userId:", userId)

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
                joinEvents: true,
            }
        })

        const event = await prisma.event.findMany({
            where: {
                userId: userId
            }
        })

        const followingOther = await prisma.follow.findMany({
            where: {
                followerId: userId
            },
            select: {
                followedId: true
            },
        })

        const followedByOther = await prisma.follow.findMany({
            where: {
                followedId: userId
            },
            select: {
                followerId: true
            }
        })

        const followingOtherArray = followingOther.map(el => el.followedId)
        const followedByOtherArray = followedByOther.map(el => el.followerId)

        const profileFollowedByOther = await prisma.user.findMany({
            where: {
                id: { in: [...followedByOtherArray] }
            }
        })

        const profileFollowingOther = await prisma.user.findMany({
            where: {
                id: { in: [...followingOtherArray] }
            }
        })

        delete profile.password
        profile.userCategorys = profile.userCategorys.map(el => el.categoryName)
        profile.userInterests = profile.userInterests.map(el => el.categoryName)
        profile.event = event
        profile.following = profileFollowingOther
        profile.followed = profileFollowedByOther
        console.log("🚀 ~ file: user-controller.js:87 ~ exports.getUserById= ~ profile:", profile)
        res.status(200).json(profile)
    } catch (err) {
        next(err)
    }
}