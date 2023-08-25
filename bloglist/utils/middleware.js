const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
    try {
        const authorization = request.get('authorization')
        if (authorization && authorization.startsWith) {
            request.token = authorization.replace('Bearer ', '')
        } else {
            request.token = null
        }
    } catch(exception) {
        console.log(exception.name)
    }

    next()
}

const userExtractor = async (request, response, next) => {
    if (request.token) {
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        request.user = await User.findById(decodedToken.id)   
    }
    next()
}

module.exports = { 
    tokenExtractor,
    userExtractor
}