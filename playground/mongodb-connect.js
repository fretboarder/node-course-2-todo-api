//const MongoClient = require('mongodb').MongoClient

// ES6 De-Structuring
const {MongoClient, ObjectID} = require('mongodb')

// MongoClient.connect('mongodb://localhost:27017/TodoApp')
// .then((client) => {
//     const db = client.db('TodoApp')
//     return db.collection('Todos').insertOne({
//         text: 'Something more to do',
//         completed: false         
//     }, )
// }).then((result) => {
//     console.log(JSON.stringify(result.ops))
// }).catch((reason) => {
//     console.log('Failure: ', reason)
// })
MongoClient.connect('mongodb://localhost:27017/TodoApp')
.then((client) => {
    const db = client.db('TodoApp')
    return db.collection('Users').insertOne({
        name: 'Pfustl',
        age: 33,
        location: 'USA'         
    })
}).then((result) => {

    console.log(JSON.stringify(result.ops[0]._id.getTimestamp()))
}).catch((reason) => {
    console.log('Failure:  ', reason)
})


// MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
//     if (err) {
//         return console.log('Unable to connect to MongoDB')
//     }
//     console.log('Connected to MongoDB server')
//     const db = client.db('TodoApp')

//     db.collection('Todos').insertOne({
//         text: 'Something to do',
//         completed: false    
//     }, (err, result) => {
//         if (err) {
//             return console.log('Unable to inster into MongoDB', err)
//         }
//         console.log(JSON.stringify(result.ops, undefined, 2))
//     })

//     client.close()
// })