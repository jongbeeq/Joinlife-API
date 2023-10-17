const prisma = require("../models/prisma")

exports.getCategory = async (req, res, next) => {
    try {
        const allCategory = await prisma.category.findMany()
        res.status(200).json({ category: allCategory.map(categoryObj => categoryObj.categoryName) })
    } catch (err) {
        next(err)
    }
}