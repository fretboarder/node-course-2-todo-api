const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

let UserSchema =  new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

// override toJSON to avoid confidental data to be sent back to the client
UserSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    return _.pick(userObject, ['_id', 'email'])
}


// custom function
UserSchema.methods.generateAuthToken = function() {
    let user = this
    const access = 'auth'
    const token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString()

    user.tokens = user.tokens.concat({access, token})

    return user.save().then(() => {
        return token
    })
}

UserSchema.statics.findByToken = function(token) {
    const User = this
    let decoded
    
    try {
        decoded = jwt.verify(token, 'abc123')
    } catch (e) {
        return Promise.reject(e)
    }
    
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}


UserSchema.statics.findByCredentials = function(email, password) {
    const User = this
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject()
        }
        // returns a Promise
        return bcrypt.compare(password, user.password).then((match) => {
            if (match) return Promise.resolve(user)
            else       return Promise.reject()
        })
    })
}


// mongoose middleware, triggered before document is saved
UserSchema.pre('save', function(next) {
    const user = this

    if (user.isModified('password')) {
        bcrypt.genSalt(10).then((salt) => {
            return bcrypt.hash(user.password, salt)
        }).then((hash) => {
            user.password = hash
            next()
        })
    }
    else {
        next()
    }
})


const User = mongoose.model('User', UserSchema)

module.exports = {User}