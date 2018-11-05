const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI).then((mongoose) => {
    console.log('mongoose connected to localhost:27017')
})

module.exports = {
    mongoose
}
