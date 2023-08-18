const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
    try {
        if (!request.body.likes) {
            request.body.likes = 0
        }
        const blog = new Blog(request.body)

        const result = await blog.save()
        response.status(201).json(result)
    } catch(exception) {
        if (exception.name === 'ValidationError') {
            response.status(400).json({exception: exception.message})
        } 
    }
})

module.exports = blogRouter