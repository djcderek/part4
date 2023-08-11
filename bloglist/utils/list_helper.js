const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((accumulator, blog) => {
        return accumulator + blog.likes
    }, 0)
}
  
module.exports = {
    dummy,
    totalLikes
}