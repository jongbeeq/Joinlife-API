const prisma = require("../models/prisma")
const { uploadToCloud } = require("../utils/cloudinary-service")
const createError = require("../utils/create-error")
const selectCategory = require("../models/selectCategory")

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

        const getPost = await prisma.posts.findUnique({
            where: {
                id: contentPost.id
            },
            include: {
                postFiles: {
                    select: {
                        file: true
                    }
                },
                user: {
                    select: {
                        id: true,
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

        // const resCreatePost = { ...contentPost, postCategorys: categoryPostMapping }
        // console.log("🚀 ~ file: post-controller.js:101 ~ exports.createPost= ~ resCreatePost:", resCreatePost)

        res.status(201).json(getPost)

    } catch (err) {
        next(err)
    }
}

exports.getAllPost = async (req, res, next) => {
    try {
        console.log("to getPost")
        const userId = req.user.id
        const allPost = await prisma.posts.findMany({
            // take: 3,
            orderBy: [
                {
                    createdAt: 'desc'
                }
            ],
            // where: {
            //     postFiles: {
            //         some: {
            //             id: {
            //                 gt: 0
            //             }
            //         }
            //     }
            // },
            include: {
                postFiles: {
                    select: {
                        file: true
                    }
                },
                user: {
                    select: {
                        id: true,
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

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId
        console.log(req.params)
        console.log(postId)
        const existPost = await prisma.posts.findFirst({
            where: {
                id: +postId,
                userId: +req.user.id
            }
        })
        console.log("🚀 ~ file: post-controller.js:196 ~ exports.deletePost ~ existPost:", existPost)

        if (!existPost) {
            return next(createError('Cannot delete this post', 400))
        }

        await prisma.posts.delete({
            where: {
                id: +existPost.id
            }
        });
        res.status(200).json({ message: 'Deleted' })
    } catch (err) {
        next(err)
    }
}

exports.editPost = async (req, res, next) => {
    try {
        const { postId, message, category } = req.body
        console.log("🚀 ~ file: post-controller.js:215 ~ exports.editPost= ~ req.body:", req.body.category)
        console.log("🚀 ~ file: post-controller.js:215 ~ exports.editPost= ~ req.files:", req.files)

        const existPost = await prisma.posts.findFirst({
            where: {
                id: +postId,
                userId: +req.user.id
            }
        })

        console.log(existPost)

        if (!existPost) {
            return next(createError('Cannot edit this post', 400))
        }

        if ((!message || !message.trim()) && (!req.files || req?.files.length === 0)) {
            return next(createError('Message or image is required', 400))
        }

        let updateFile
        if (req.files) {
            const pendingFiles = await req.files.map(
                file => {
                    console.log(file.mimetype)
                    const fileType = file.mimetype.split('/')[0]
                    return uploadToCloud(file.path, fileType)
                }
            )

            const files = await Promise.all(pendingFiles)

            updateFile = files.map(path => {
                const fileRow = {}
                fileRow.file = path
                return fileRow
            })
        }

        const updateContentPost = await prisma.posts.update({
            where: {
                id: +postId,
                userId: +req.user.id
            },
            data: {
                message: message,
                postFiles: {
                    create: updateFile
                }
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
        })

        if (req.files) {
            updateContentPost.postFiles = updateContentPost.postFiles.map(postFile => postFile.file)
        }

        let categoryPostMapping
        if (category) {

            const existPostCategory = await prisma.postCategory.findFirst({
                where: {
                    postId: +postId,
                }
            })
            if (existPostCategory) {
                console.log(+postId)
                await prisma.postCategory.deleteMany({
                    where: {
                        postId: +postId
                    }
                })
            }
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
                        postId: updateContentPost.id,
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
        const resUpdatePost = { ...updateContentPost, postCategorys: categoryPostMapping }

        res.status(200).json(resUpdatePost)
    } catch (err) {
        next(err)
    }
}

exports.getPostById = async (req, res, next) => {
    try {
        console.log("🚀 ~ file: post-controller.js:361 ~ exports.getPostById= ~ req.body.postId:", req.body)
        const data = await prisma.posts.findUnique({
            where: {
                id: req.body.postId
            },
            include: {
                postCategorys: true,
                postFiles: true
            }
        })
        console.log(data)
        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}