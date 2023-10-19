const prisma = require("../models/prisma")
const selectCategory = require("../models/selectCategory")
const { uploadToCloud } = require("../utils/cloudinary-service")

exports.updateProfile = async (req, res, next) => {
    try {
        const { description, category, interest } = req.body

        const responseUser = {}

        if (description) {
            console.log(req.body)
            const userDescription = await prisma.user.update({
                data: {
                    description: description
                },
                where: {
                    id: req.user.id
                },
                select: {
                    description: true
                }
            })
            responseUser.description = userDescription.description
        }

        if (req.file) {
            console.log(req.file)
            const profileImage = await uploadToCloud(req.file.path)
            const userProfileImage = await prisma.user.update({
                data: {
                    profileImage: profileImage
                },
                where: {
                    id: req.user.id
                },
                select: {
                    profileImage: true
                }
            })
            responseUser.profileImage = userProfileImage.profileImage
        }

        responseUser.category = await Promise.resolve(selectCategory(req.user.id, category, "userCategory"))
        responseUser.interest = await Promise.resolve(selectCategory(req.user.id, interest, "userInterest"))
        console.log("success")
        res.status(200).json(responseUser)
    } catch (err) {
        next(err)
    }
}
