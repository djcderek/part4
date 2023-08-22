const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/users')

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const passworHash = await bcrypt.hash(password, 10)

    const user = new User({
        username,
        name,
        passworHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.status(200).json(users)
})

module.exports = usersRouter