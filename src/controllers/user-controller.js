const prisma = require("../models/prisma")

exports.updateProfile = async (req, res, next) => {
    try {
        const { description, category, interest } = req.body

        if (description) {
            await prisma.user.update({
                data: {
                    description: req.file.path
                },
                where: {
                    id: req.user.id
                },
            })
        }

        if (req.file) {
            await prisma.user.update({
                data: {
                    profileImage: req.file.path
                },
                where: {
                    id: req.user.id
                },
            })
        }

        if (category) {
            await prisma.userCategory.createMany({
                data: category.map(category => {
                    const inputCategory = {}
                    inputCategory.ca
                })
            })
        }

    } catch (err) {
        next(err)
    }
}