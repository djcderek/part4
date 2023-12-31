//require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
//const Blog = require('./models/blog')
const blogRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const {PORT, MONGODB_URI} = require('./utils/config')
const middleware = require('./utils/middleware')

//const mongoUrl = process.env.MONGODB_URI
mongoose.connect(MONGODB_URI)

app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)
app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

module.exports = app