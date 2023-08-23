const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const { application } = require('express')

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
    },
    {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12
    },
    {
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10
    },
    {
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
    },
    {
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2
    }  
]

const users = [
  {
    username: 'root',
    name: 'user',
    password: 'password'
  }
]

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

test('HTTP POST request works', async () => {
  const newBlog = {
    title: 'New Blog',
    author: 'New Author',
    url: 'New URL',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  blogsAtEnd.map(blog => blog.toJSON())
  //const blogsAtEnd = await api.get('/api/blogs')
  expect(blogsAtEnd).toHaveLength(3)

  const title = blogsAtEnd.map(blog => blog.title)
  expect(title).toContain('New Blog')
})

test('likes are defualted to zero if missing', async () => {
  const newBlog = {
    title: 'Without likes',
    author: 'Doesnt get likes',
    url: 'Sadnesss'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const addedBlog = await Blog.findOne({title: 'Without likes'})
  expect(addedBlog.likes).toBe(0)
})

test('cannot add note without title or url', async () => {
  const newBlog = {
    author: 'Titleless',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('can delete note', async () => {
  const beforeBlogs = await Blog.find({})
  beforeBlogs.map(blog => blog.toJSON())

  const blogToDelete = beforeBlogs[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const afterBlog = await Blog.find({})
  afterBlog.map(blog => blog.toJSON())
  expect(afterBlog).toHaveLength(beforeBlogs.length - 1)

  const titles = afterBlog.map(blog => blog.title)
  expect(titles).not.toContain(blogToDelete.title)
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
      .post('/api/users', )
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