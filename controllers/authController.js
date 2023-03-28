const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
// what i used to assist with writing the controllers: https://javascript.plainenglish.io/node-js-jwt-user-login-and-making-an-authenticated-request-9acf9e3d7559  && https://www.bezkoder.com/node-js-mongodb-auth-jwt/

// register a new user
const registerUser = asyncHandler(async(req, res) => {
    const {name, email, password} = req.body

    // validation
    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please make sure all fields have been filled")
    }
    // find if user already exists
    const  userExists = await User.findOne({email})

    if(userExists){
        res.status(403)
        throw new Error("There's already an account with that email address")
    }
    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //  create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })
    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token : generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error("invalid user information")
    }
})

// login a user
const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body
    const user = await User.findOne({email})

    // check if user name and password matches
    if(user && (await bcrypt.compare(password, user.password))){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(403)
        throw new Error("Invalid username or password")
    }
})

// get current user
const currentUser = asyncHandler(async(req, res) => {
    const user = {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
    }
    res.status(200).json(user)
})

// generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
} 

module.exports = {
    registerUser,
    loginUser,
    currentUser
}