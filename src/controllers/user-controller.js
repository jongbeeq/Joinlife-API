const prisma = require("../models/prisma")
const selectCategory = require("../models/selectCategory")

exports.updateProfile = async (req, res, next) => {
    try {
        const { description, category, interest } = req.body
        console.log("🚀 ~ file: user-controller.js:7 ~ exports.updateProfile= ~ req.body:", req.body.category)
        console.log("🚀 ~ file: user-controller.js:7 ~ exports.updateProfile= ~ req.body:", req.file)

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
            const userFile = await prisma.user.update({
                data: {
                    profileImage: req.file.path
                },
                where: {
                    id: req.user.id
                },
            })
            responseUser.file = userFile
        }

        console.log("🚀 ~ file: user-controller.js:35 ~ exports.updateProfile= ~ responseUser:", responseUser)
        responseUser.category = await Promise.resolve(selectCategory(req.user.id, category, "userCategory"))
        responseUser.interest = await Promise.resolve(selectCategory(req.user.id, interest, "userInterest"))

        res.status(200).json(responseUser)
    } catch (err) {
        next(err)
    }
}