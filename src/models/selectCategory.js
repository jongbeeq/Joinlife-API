const prisma = require("../models/prisma")

const selectCategory = async (idItem, category, tableItem) => {
    try {
        console.log("🚀 ~ file: selectCategory.js:4 ~ selectCategory ~ category:", category)

        if (category) {
            await prisma[tableItem].deleteMany({
                where: {
                    userId: idItem
                }
            })

            await prisma[tableItem].createMany({
                data: category.map(category => {
                    const inputCategory = {
                        userId: idItem
                    }
                    inputCategory.categoryName = category
                    return inputCategory
                }),
            })

            const userCategory = await prisma[tableItem].findMany({
                where: {
                    userId: idItem
                },
                select: {
                    categoryName: true
                }
            })

            return userCategory.map(category => category.categoryName)
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = selectCategory
