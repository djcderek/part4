const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     if (authorization && authorization.startsWith('Bearer ')) {
//         return authorization.replace('Bearer ', '')
//     }
//     return null
// }

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('users', { username: 1, name: 1, id: 1})
    response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
    try {
        if (!request.body.likes) {
            request.body.likes = 0
        }
        const body = request.body
        //const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'invalid token'})
        }
        const user = request.user//await User.findById(decodedToken.id)
        //const user = await User.findById(body.userId)
        console.log(user)

        //const blog = new Blog(request.body)
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            users: user.id
        })

        const result = await blog.save()
        console.log(result._id)
        user.blog = user.blog.concat(result.id)
        await user.save()
        //user
        response.status(201).json(result)
    } catch(exception) {
        if (exception.name === 'ValidationError') {
            response.status(400).json({error: exception.message})
        } else if (exception.name === 'JsonWebTokenError') {
            response.status(400).json({ error: exception.message})
        }
    }
})

blogRouter.delete('/:id', async (request, response) => {
    try {
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'invalid token'})
        }
        const user = await User.findById(decodedToken.id)
    
        const toDelete = await Blog.findById(request.params.id)
        console.log(toDelete)
        const canDelete = toDelete.users.toString() === user.id.toString()
    
        if (!canDelete) {
            return response.status(401).json({ error: 'invalid user' })
        }
    
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } catch(exception) {
        response.status(400).json({ error: exception.name })
    }
})

blogRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })

    response.json(updatedBlog)
})

module.exports = blogRouter