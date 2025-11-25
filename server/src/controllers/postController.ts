const cloudinary = require('../utils/cloudinaryConfig')
const prisma = require('../prisma')
const fs = require('fs').promises
import type { Prisma } from '../generated/prisma'
import type { Request, Response } from 'express'
import MulterError = require('multer')
import type multerTypes = require('multer')




interface MulterRequest extends Request {
    file?: Express.Multer.File,
    user: {
        id: number,
        name: string
    }
}
interface Comment {
    id: number,
    text: string,
    userId: number
}
type postWithAuthor = Prisma.PostGetPayload<{
    include: {
        author: {
            select: {
                id: true,
                email: true,
                name: true
            }
        },
        likes: true,
        comments: true
    }
}>




const addPost = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const { title, content }: { title?: string, content?: string } = req.body
        if (!title || !content) {
            return res.status(400).json({ msg: 'title and content are required' })
        }
        if (title.trim().length === 0 || content.trim().length === 0) {
            return res.status(400).json({ msg: "Title and content cannot be empty" })
        }

        if (req.file?.path) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'posts',
                    resource_type: 'image'
                })
                const imageUrl = result.secure_url
                const cloudinaryPublicId = result.public_id
                await fs.unlink(req.file.path)

                const post = await prisma.post.create({
                    data: {
                        title: title.trim(),
                        content: content.trim(),
                        imageUrl: imageUrl,
                        authorId: req.user.id,
                        cloudinaryPublicId: cloudinaryPublicId,

                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        likes: true

                    }
                })
                return res.status(201).json({
                    msg: 'Post created Successfully',
                    post: {
                        id: post.id,
                        title: post.title,
                        content: post.content,
                        imageUrl: post.imageUrl,
                        authorId: post.authorId,
                        likes: post.likes.length,
                        likedByUser: false,
                        createdAt: post.createdAt

                    }
                })
            }
            catch (error) {
                console.log('cloudinary upload error', error)
            }
        }


    } catch (error) {
        console.log('error while adding the post', error)

    }

}

const getAllPosts = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const allposts: postWithAuthor[] = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {

                        id: true,
                        name: true,
                        email: true
                    }
                },
                likes: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        const formattedPosts = allposts.map((post) => ({
            ...post,
            likes: post.likes.length,
            likedByUser: post.likes.some(like => like.userId === req.user?.id)
        }))
        return res.status(200).json({ msg: 'fetched all posts successfully', allposts: formattedPosts })
    } catch (error) {
        console.log('error while fetching all the posts', error)
        res.status(500).json({ msg: 'Error fetching  posts' });
    }

}
const getMyPosts = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const myposts: postWithAuthor[] = await prisma.post.findMany({
            where: { authorId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                likes: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
        const formattedMyPosts = myposts.map((post) => ({
            ...post,
            likes: post.likes.length,
            likedByUser: post.likes.some(like => like.userId === req.user?.id)
        }))
        return res.status(200).json({ msg: 'got my posts successfully', myposts: formattedMyPosts })

    } catch (error) {
        console.error("Error fetching my posts:", error);
        res.status(500).json({ msg: "Error fetching my posts" })
    }


}

const deletePost = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const postId = Number(req.params.id);
        const userId = req.user.id;
        const post = await prisma.post.findUnique({ where: { id: postId } })
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        if (post.authorId !== userId) {
            return res.status(403).json({ msg: 'unauthorized:you can delete only your posts' })
        }
        if (post.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(post.cloudinaryPublicId)
        }
        await prisma.post.delete({ where: { id: postId } })

    } catch (error) {
        console.log('error while deleting the post', error)
        res.status(500).json({ msg: 'Error deleting post' });
    }
}

const toggleLike = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const postId = Number(req.params.id);
        const userId = req.user.id;
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ msg: 'post not found' })
        }
        const existingLike = await prisma.Like.findUnique({
            where: {
                userId_postId: {
                    userId, postId
                }
            }
        })
        if (existingLike) {
            await prisma.Like.delete({ where: { id: existingLike.id } })
        } else {
            await prisma.Like.create({ data: { userId, postId } })
        }
        const totalLikes = await prisma.Like.count({ where: { postId } })
        return res.status(200).json({
            msg: existingLike ? "UnLike" : "Like",
            likedByUser: !existingLike,
            likes: totalLikes
        })

    } catch (error) {
        res.status(500).json({ msg: "Error toggling like" });
    }


}

const commentPost = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {

        const postId = Number(req.params.id);
        const userId = req.user.id;
        const { text } = req.body;
        if (!text || !text.trim())
            return res.status(400).json({ msg: "Comment cannot be empty" });
        const comment = await prisma.comment.create({
            data: {
                text,
                userId,
                postId
            }
        })
        return res.status(201).json({ msg: "Comment added", comment });
    } catch (error) {
        res.status(500).json({ msg: "Error commenting on Post" });
    }
}

const deleteComment = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const commentId = Number(req.params.commentId)
        const userId = req.user.id

        const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: true } })
        if (!comment) {
            return res.status(404).json({ msg: 'comment not found' })
        }
        if (userId !== comment.post.authorId && comment.userId !== userId) {
            return res.status(403).json({ msg: "Unauthorized to delete this comment" });
        }
        await prisma.comment.delete({ where: { id: commentId } })
        return res.status(200).json({ msg: "Comment deleted", commentId });

    } catch (error) {
        res.status(500).json({ msg: "Error deleting the comment on a Post" });
    }
}

const getLikedUsers = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const postId = Number(req.params.postId);
        const likes = await prisma.like.findMany({
            where: { postId: postId },
            include: {
                user: {
                    select: { id: true, email: true, name: true }
                }
            }
        })
        return res.status(200).json({ likes })

    } catch (error) {
        res.status(500).json({ msg: "Error fetching the liked users on a Post" });
    }
}
const getProfileDetails = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const userId = req.user.id;
        const posts = await prisma.post.findMany({
            where: { authorId: userId },
            include: {
                likes: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                },
                comments: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                }
            }
        })
        const totalPosts = posts.length;
        const totalLikes = posts.reduce((sum: number, p: postWithAuthor) => sum + p.likes.length, 0)
        const totalComments = posts.reduce((sum: number, p: postWithAuthor) => sum + p.comments.length, 0)
        return res.status(200).json({
            totalPosts,
            totalLikes,
            totalComments,
            details: posts
        })

    } catch (error) {
        res.status(500).json({ msg: "Error getting profile details" });
    }
}


const updateProfilePic = async (req: MulterRequest, res: Response): Promise<Response | void> => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ msg: 'no file uploaded' })
        }
        try {
            if (req.file.path) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'profilepics',
                    resource_type: 'image'
                })
                const imageurl = result.secure_url
                const cloudinarypublicid = result.public_id
                await fs.unlink(req.file.path)

                const updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { profilePic: imageurl }
                })
            
            return res.status(200).json({
                msg: "Profile picture updated",
                profilePic: imageurl,
                user:updatedUser
                
            })
        };

        } catch (error) {
            console.log('error in cloudinary profile pic upload ', error)
        }



    } catch (error) {
        console.log('error while updating the profile pic', error)
    }


}




module.exports = { addPost, getAllPosts, getMyPosts, deletePost, toggleLike, commentPost, deleteComment, getLikedUsers, getProfileDetails, updateProfilePic }