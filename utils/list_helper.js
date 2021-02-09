const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, item) => sum + item.likes, 0)
}

const favouriteBlog = (blogs) => {

  if (blogs.length === 0) return null

  const result = blogs.reduce((favourite, blog) => {
    return ((favourite.likes || 0) > blog.likes) ? favourite : blog
  }, {})

  return ({
    title: result.title,
    author: result.author,
    likes: result.likes
  })
}

const mostBlogs = (blogs) => {

  if (blogs.length === 0) return null

  const amountOfBlogs = new Map()
  blogs.forEach(blog => {
    if (amountOfBlogs.has(blog.author)) {
      amountOfBlogs.set(blog.author, amountOfBlogs.get(blog.author) + 1)
    } else {
      amountOfBlogs.set(blog.author, 1)
    }
  })
  const result = [...amountOfBlogs.entries()].reduce((most, blog) => most[1] > blog[1] ? most : blog)

  return {
    author: result[0],
    blogs: result[1]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const amountOfLikes = new Map()
  blogs.forEach(blog => {
    if (amountOfLikes.has(blog.author)) {
      amountOfLikes.set(blog.author, amountOfLikes.get(blog.author) + blog.likes)
    } else {
      amountOfLikes.set(blog.author, blog.likes)
    }
  })
  const result = [...amountOfLikes.entries()].reduce((most, blog) => most[1] > blog[1] ? most : blog)

  return {
    author: result[0],
    likes: result[1]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}