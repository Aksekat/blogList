const Blog = require('../models/blog')
const User = require('../models/user')

const initialUsers = [
  {
    username: 'Placeholder',
    name: 'Mr. Placeholder',
    passwordHash: 'secret'
  },
  {
    username: 'Placeholder2',
    name: 'Ms. Placeholder2',
    passwordHash: 'secret2',
  }
]

const initialBlogs = [
  {
    title: 'testBlog1',
    author: 'testAuthor1',
    url: 'https://placeholder.link/1',
    likes: 5,
  },
  {
    title: 'testBlog2',
    author: 'testAuthor2',
    url: 'https://placeholder.link/2',
    likes: 8
  }
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'willremovethissoon',
    author: 'toberemovedauthor',
    url: 'placeholder',
    likes: 3
  })

  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb
}