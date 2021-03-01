const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

let token
let user

beforeAll(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  user = new User({ username: 'root', name: 'root', passwordHash })
  await user.save()
  const login = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  token = login.body.token
})

describe('When there are some blogs in the database and no new blogs are added', () => {
  beforeAll(async () => {
    await Blog.deleteMany({})

    for (const blog of helper.initialBlogs) {
      blog.user = user._id
      /**await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(blog)*/
    }
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blogs have a field "id"', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })

  test('a blog without a title cannot be added', async () => {
    const newBlog = {
      author: 'testAuthor3',
      url: 'https://placeholder.link/5',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('a blog without a url cannot be added', async () => {
    const newBlog = {
      title: 'testBlog3',
      author: 'testAuthor3'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('a blog cannot be added if no token is provided', async () => {
    const newBlog = {
      title: 'testBlog3',
      author: 'testAuthor3',
      url: 'https://placeholder.link/3',
      likes: 4
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('When there are two blogs in the database', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    for (const blog of helper.initialBlogs) {
      blog.user = user._id
      /**await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(blog)*/
    }
    await Blog.insertMany(helper.initialBlogs)
  })

  test('likes default to 0 if not defined', async () => {
    const newBlog = {
      title: 'testBlog3',
      author: 'testAuthor3',
      url: 'https://placeholder.link/3',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
    expect(response.body.likes).toEqual(0)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'testBlog3',
      author: 'testAuthor3',
      url: 'https://placeholder.link/3',
      likes: 4
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(blog => blog.title)
    expect(contents).toContain('testBlog3')
  })

  test('Deletion of a blog succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

afterAll(async () => {
  mongoose.connection.close()
})