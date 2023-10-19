// const  = require("../middlwares/upload")
const prisma = require("../models/prisma")
const { uploadToCloud } = require("../utils/cloudinary-service")
const createError = require("../utils/create-error")

exports.createPost = async (req, res, next) => {
    try {
        const { message, category } = req.body

        if ((!message || !message.trim()) && !req.files) {
            return next(createError('Message or image is required', 400))
        }

        const pendingFiles = await req.files.map(
            file => {
                console.log(file.mimetype)
                const fileType = file.mimetype.split('/')[0]
                return uploadToCloud(file.path, fileType)
            }
        )

        const files = await Promise.all(pendingFiles)

        const createFiles = files.map(path => {
            const fileRow = {}
            fileRow.file = path
            return fileRow
        })

        const contentPost = await prisma.posts.create({
            data: {
                userId: req.user.id,
                message: message,
                postFiles: { create: createFiles }
            },
            include: {
                user: {
                    select: {
                        username: true,
                        profileImage: true
                    }
                },
                postFiles: {
                    select: {
                        file: true
                    }
                }
            }
        })

        contentPost.postFiles = contentPost.postFiles.map(postFile => postFile.file)

        const notFoundCategoryMessage = ": Category Not Found"
        const pendingCategoryFound = category.map(async nameCategory => {
            const categoryRow = await prisma.category.findUnique({
                where: {
                    categoryName: nameCategory
                }
            })
            if (!categoryRow) {
                return nameCategory + notFoundCategoryMessage
            }
            return categoryRow
        }
        )
        const categoryFound = await Promise.all(pendingCategoryFound)

        const categoryPost = categoryFound.filter(category => typeof (category) === 'object')

        const pendingCategoryPostMapping = categoryPost.map(async (categoryRow) => {

            const categoryList = await prisma.postCategory.create({
                data: {
                    postId: contentPost.id,
                    categoryName: categoryRow.categoryName,
                },
                include: {
                    category: {
                        select: {
                            categoryName: true
                        }
                    }
                }
            })
            return categoryList
        })

        const categoryPostMapping = await Promise.all(pendingCategoryPostMapping)

        res.status(201).json({ ...contentPost, category: categoryPostMapping.map(obj => obj.categoryName) })

    } catch (err) {
        next(err)
    }
}


