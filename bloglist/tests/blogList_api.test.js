const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { application, json } = require('express')
//const jwt = require('jsonwebtoken')
//const loginRouter = require('../controllers/login')

const blogs = [
    {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7
    },
    {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5
    }
]

const users = [
  {
    username: 'root',
    name: 'user',
    password: 'password'
  }
]

describe('does not require authentication', () => {
  beforeAll(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(blogs[0])
    await blogObject.save()

    blogObject = new Blog(blogs[1])
    await blogObject.save()
  })
  test('test HTTP GET request', async () => {
    api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
  })

  test('length of response', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(2)
  })

  test('contains correct response', async () => {
    const response = await api.get('/api/blogs')
    const title = response.body.map(r => r.title)
    expect(title).toContain('React patterns')
  })

  test('id property exists', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('does require authentication', () => {
  const allUsers = [
    {
      username: "rootuser",
      name: "root",
      password: "password"
    },
    {
      username: "first test user",
      name: "firstuser",
      password: "password"
    }
  ]

  beforeAll(async () => {
    await User.deleteMany({})
    //await Blog.deleteMany({})

    const newUser = allUsers[0]

    await api
      .post('/api/users')
      .send(newUser)

    const loginUser = {
      username: newUser.username,
      password: newUser.password
    }

    //console.log(loginUser)
    const tokenObject = await api
      .post('/api/login')
      .send(loginUser)

    const token = tokenObject.body.token
    //console.log(token)
    const authHeader = `Bearer ${token}`
    //console.log(authHeader)

    const newBlog = {
      title: "testing authentication through jest",
      author: "root",
      URL: "idk",
      likes: 4
    }

    await api
      .post('/api/blogs')
      .set('Authorization', authHeader)
      .send(newBlog)
    //console.log(afterBlogs.body)
  })

  test('HTTP POST request works for adding new blogs', async () => {
    const blogsAtStart = await Blog.find({})
    const newUser = allUsers[1]

    await api
    .post('/api/users')
    .send(newUser)

    const loginUser = {
      username: newUser.username,
      password: newUser.password
    }

    //console.log(loginUser)
    const tokenObject = await api
      .post('/api/login')
      .send(loginUser)

    const token = tokenObject.body.token
    //console.log(token)
    const authHeader = `Bearer ${token}`

    const newBlog = {
      title: 'New Blog testing post',
      author: 'New Author',
      url: 'New URL',
      likes: 5
    }

    await api
    .post('/api/blogs')
    .set('Authorization', authHeader)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await Blog.find({})
    blogsAtEnd.map(blog => blog.toJSON())
    //const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1)
  
    const title = blogsAtEnd.map(blog => blog.title)
    expect(title).toContain('New Blog testing post')
  })

  test('likes are defaulted to zero if missing', async () => {
    //const blogsAtStart = await Blog.find({})
    const beforeUsers = await User.find({})
    //console.log('likes test:', beforeUsers.map(user => user.toJSON()))

    const newUser = allUsers[1]

    await api
      .post('/api/users')
      .send(newUser)

    const loginUser = {
      username: newUser.username,
      password: newUser.password
    }

    //console.log(loginUser)
    const tokenObject = await api
      .post('/api/login')
      .send(loginUser)

    const token = tokenObject.body.token
    //console.log(token)
    const authHeader = `Bearer ${token}`

    const newBlog = {
      title: 'Without likes',
      author: 'Doesnt get likes',
      url: 'Sadnesss'
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', authHeader)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const addedBlog = await Blog.findOne({title: 'Without likes'})
    expect(addedBlog.likes).toBe(0)
  })

  test('can delete note', async () => {
    const beforeBlogs = await Blog.find({})
    const beforeUsers = await User.find({})
    //console.log(beforeUsers)
    const jsonUsers = beforeUsers.map(user => user.toJSON())
    const blogToDeleteID = jsonUsers[1].blog[0].toString()
    const newUser = allUsers[1]

    const loginUser = {
      username: newUser.username,
      password: newUser.password
    }

    //console.log(loginUser)
    // //console.log(loginUser)
    const tokenObject = await api
      .post('/api/login') 
      .send(loginUser)

    //console.log(tokenObject.body)

    const token = tokenObject.body.token
    // //console.log(token)
    const authHeader = `Bearer ${token}`

    await api
      .delete(`/api/blogs/${blogToDeleteID}`)
      .set('Authorization', authHeader)
      .expect(204)
  
    const afterBlog = await Blog.find({})
    afterBlog.map(blog => blog.toJSON())
    expect(afterBlog).toHaveLength(beforeBlogs.length - 1)
  })

  test('adding blog fails with proper status code without token', async () => {
    const blogsAtStart = await Blog.find({})

    const newBlog = {
      title: 'Blog without auth',
      author: 'New Author',
      url: 'New URL',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtStart).toHaveLength(blogsAtEnd.length)
  })

  test('cannot add note without title or url', async () => {
    const newUser = allUsers[1]
  
    await api
      .post('/api/users')
      .send(newUser)
  
    const loginUser = {
      username: newUser.username,
      password: newUser.password
    }
  
    //console.log(loginUser)
    const tokenObject = await api
      .post('/api/login')
      .send(loginUser)
  
    const token = tokenObject.body.token
    //console.log(token)
    const authHeader = `Bearer ${token}`
  
    const newBlog = {
      //title: 'New Blog testing post',
      author: 'New Author',
      url: 'New URL',
      likes: 5
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', authHeader)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
})

test('can update note', async () => {
  const allBlogs = await Blog.find({})
  //console.log(allBlogs)
  allBlogs.map(blog => blog.toJSON())
  //console.log(allBlogs)

  const blogToUpdate = allBlogs[0]
  const updatedBlog = {...blogToUpdate._doc, likes: 100}
  //console.log(blogToUpdate._doc)

  //console.log(updatedBlog)

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)

  const afterBlogs = await Blog.find({})
  afterBlogs.map(blogs => blogs.toJSON())
  const likes = afterBlogs.map(blog => blog.likes)

  //console.log()
  
  expect(likes).toContain(100)
})

describe('testing users', () => {
  beforeAll(async () => {
    await User.deleteMany({})

    const firstUser = new User(users[0])
    await firstUser.save()
  })

  test('username cannot be too short', async () => {
    const beforeUsers = await User.find({})
    const jsonBeforeUsers =beforeUsers.map(user => user.toJSON())
    //console.log(jsonBeforeUsers)
    //console.log(beforeUsers)

    const user = {
      username: 'a',
      name: 'name',
      password: 'password'
    }

    await api
      .post('/api/users', )
      .send(user)
      .expect(400)

    const afterUsers = await User.find({})
    const jsonAfterUsers = afterUsers.map(user => user.toJSON())

    expect(jsonAfterUsers.length).toBe(jsonBeforeUsers.length)
  })

  test('password cannot be too short', async () => {
    const beforeUsers = await User.find({})
    const jsonBeforeUsers =beforeUsers.map(user => user.toJSON())
    //console.log(jsonBeforeUsers)
    //console.log(beforeUsers)

    const user = {
      username: 'longusername',
      name: 'name',
      password: 'p'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)

    const afterUsers = await User.find({})
    const jsonAfterUsers = afterUsers.map(user => user.toJSON())

    expect(jsonAfterUsers.length).toBe(jsonBeforeUsers.length)
  })
})

afterAll(async () => {
    await mongoose.connection.close()
})