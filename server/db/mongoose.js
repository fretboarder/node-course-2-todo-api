const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/TodoApp').then((mongoose) => {
    console.log('mongoose connected to localhost:27017')
})

module.exports = {
    mongoose
}
