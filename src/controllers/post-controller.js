// const  = require("../middlwares/upload")
const prisma = require("../models/prisma")
const { uploadToCloud } = require("../utils/cloudinary-service")
const createError = require("../utils/create-error")

exports.createPost = async (req, res, next) => {
    try {
        const { message, category } = req.body

        if ((!message || !message.trim()) && (!req.files || req?.files.length === 0)) {
            return next(createError('Message or image is required', 400))
        }

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


        if (req.files) {
            contentPost.postFiles = contentPost.postFiles.map(postFile => postFile.file)
        }


        let categoryPostMapping
        if (category) {
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

        const resCreatePost = { ...contentPost, postCategorys: categoryPostMapping }
        console.log("🚀 ~ file: post-controller.js:101 ~ exports.createPost= ~ resCreatePost:", resCreatePost)

        res.status(201).json(resCreatePost)

    } catch (err) {
        next(err)
    }
}


exports.getAllPost = async (req, res, next) => {
    try {
        console.log("to getPost")
        const userId = req.user.id
        const allPost = await prisma.posts.findMany({
            take: 3,
            orderBy: [
                {
                    createdAt: 'desc'
                }
            ],
            where: {
                id: 102,
                postFiles: {
                    some: {
                        id: {
                            gt: 0
                        }
                    }
                }
            },
            include: {
                postFiles: {
                    select: {
                        file: true
                    }
                },
                user: {
                    select: {
                        username: true,
                        profileImage: true
                    }
                },
                postCategorys: {
                    select: {
                        categoryName: true
                    }
                },
                postComments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                profileImage: true,
                            }
                        }
                    }
                }
            }
        }
        )

        console.log("🚀 ~ file: post-controller.js:116 ~ exports.getPost= ~ allPost:", allPost)
        console.log("🚀 ~ file: post-controller.js:116 ~ exports.getPost= ~ allPost:", allPost.length)
        res.status(201).json(allPost)
    } catch (err) {
        next(err)
    }
}