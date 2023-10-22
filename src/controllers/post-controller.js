// const  = require("../middlwares/upload")
const prisma = require("../models/prisma")
const { uploadToCloud } = require("../utils/cloudinary-service")
const createError = require("../utils/create-error")

exports.createPost = async (req, res, next) => {
    try {
        console.log("🚀 ~ file: post-controller.js:12 ~ exports.createPost= ~ req.files:", req.files)
        console.log("🚀 ~ file: post-controller.js:12 ~ exports.createPost= ~ req.files:", req.files.length)
        const { message, category } = req.body
        console.log("to Route-Post-Upload-Create")

        if ((!message || !message.trim()) && (!req.files || req?.files.length === 0)) {
            return next(createError('Message or image is required', 400))
        }

        console.log("to Route-Post-Upload-Create-HaveContent")
        let createFiles
        if (req.files) {
            const pendingFiles = await req.files.map(
                file => {
                    console.log(file.mimetype)
                    const fileType = file.mimetype.split('/')[0]
                    return uploadToCloud(file.path, fileType)
                }
            )

            const files = await Promise.all(pendingFiles)

            createFiles = files.map(path => {
                const fileRow = {}
                fileRow.file = path
                return fileRow
            })
        }

        console.log("to Route-Post-Upload-Create-HaveContent-PassReq.Files")
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

        console.log("to Route-Post-Upload-Create-HaveContent-PassReq.Files-PassPrisma")

        if (req.files) {
            contentPost.postFiles = contentPost.postFiles.map(postFile => postFile.file)
        }

        console.log("🚀 ~ file: post-controller.js:61 ~ exports.createPost= ~ contentPost:", contentPost)
        console.log("to Route-Post-Upload-Create-HaveContent-PassReq.Files-PassPrisma-MapResFiletoContentPost")

        let categoryPostMapping
        if (category) {
            console.log("🚀 ~ file: post-controller.js:70 ~ exports.createPost= ~ category:", category)
            console.log("🚀 ~ file: post-controller.js:70 ~ exports.createPost= ~ category:", typeof (category))
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

            categoryPostMapping = await Promise.all(pendingCategoryPostMapping)
        }

        console.log("🚀 ~ file: post-controller.js:105 ~ exports.createPost= ~ contentPost:", contentPost)
        console.log("to Route-Post-Upload-Create-HaveContent-PassReq.Files-PassPrisma-MapResFiletoContentPost-PassCategoryPostCreate")

        res.status(201).json({ ...contentPost, category: categoryPostMapping?.map(obj => obj.categoryName) })

    } catch (err) {
        next(err)
    }
}


