const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/users')

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if (password.length < 3) {
        return response.status(400).json({ error: 'Password too short' })
    }

    const passworHash = await bcrypt.hash(password, 10)

    const user = new User({
        username,
        name,
        passworHash
    })

    try {
        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch(exception) {
        response.status(400).json({ error: exception.name })
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.status(200).json(users)
})

module.exports = usersRouter