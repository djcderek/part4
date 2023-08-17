const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((accumulator, blog) => {
        return accumulator + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    const fav = blogs[0]
    return blogs.reduce((favBlog, currBlog) => {
        if (favBlog.likes >= currBlog.likes) {
            return favBlog
        } else {
            return currBlog
        }
    }, fav)
}

const mostBlogs = (blogs) => {
    const authorBlogs =  blogs.reduce((authors, blog) => {
        if (Object.hasOwn(authors, blog.author)) {
            authors[blog.author] += 1
        } else {
            authors[blog.author] = 1
        }
        return authors
    }, {})

    let blogCount = 0
    let mostAuthor
    for (author in authorBlogs) {
        if (authorBlogs[author] > blogCount) {
            blogCount = authorBlogs[author]
            mostAuthor = author
        }
    }
    return {
        author: mostAuthor,
        blogs: blogCount
    }
}

const mostLikes = (blogs) => {
     return blogs.reduce((mostLiked, currBlog) => {
        //console.log(mostLiked)
        if (currBlog.likes >= mostLiked.likes) {
            mostLiked.likes = currBlog.likes
            mostLiked.author = currBlog.author
        }
        return mostLiked
    }, {author: "", likes: 0})
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}