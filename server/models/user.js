const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
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

const User = mongoose.model('User', UserSchema)

module.exports = {User}