const prisma = require("../models/prisma")
const selectCategory = require("../models/selectCategory")
const { uploadToCloud } = require("../utils/cloudinary-service")

exports.updateProfile = async (req, res, next) => {
    try {
        const { description, category, interest } = req.body

        const responseUser = {}

        if (description) {
            const userDescription = await prisma.user.update({
                data: {
                    description: description
                },
                where: {
                    id: req.user.id
                },
            })
            responseUser.description = userDescription
        }

        if (req.file) {
            const profileImage = await uploadToCloud(req.file.path)
            const userFile = await prisma.user.update({
                data: {
                    profileImage: profileImage
                },
                where: {
                    id: req.user.id
                },
            })
            responseUser.profileImage = userFile
        }

        responseUser.category = await Promise.resolve(selectCategory(req.user.id, category, "userCategory"))
        responseUser.interest = await Promise.resolve(selectCategory(req.user.id, interest, "userInterest"))

        res.status(200).json(responseUser)
    } catch (err) {
        next(err)
    }
}