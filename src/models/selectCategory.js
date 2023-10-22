const prisma = require("../models/prisma")

const selectCategory = async (idItem, category, tableItem) => {
    try {
        console.log("🚀 ~ file: selectCategory.js:4 ~ selectCategory ~ category:", category)
        console.log("🚀 ~ file: selectCategory.js:4 ~ selectCategory ~ category:", typeof (category))

        if (category) {
            const categorySelected = category.filter(el => el !== "null")
            console.log("🚀 ~ file: selectCategory.js:10 ~ selectCategory ~ categorySelected:", categorySelected)

            await prisma[tableItem].deleteMany({
                where: {
                    userId: idItem
                }
            })

            await prisma[tableItem].createMany({
                data: categorySelected.map(category => {
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
