//const MongoClient = require('mongodb').MongoClient

// ES6 De-Structuring
const {MongoClient, ObjectID} = require('mongodb')

// MongoClient.connect('mongodb://localhost:27017/TodoApp')
// .then((client) => {
//     const db = client.db('TodoApp')
    
//     return db.collection('Todos').find({
//         _id: new ObjectID('5be01a28df1e0a2becf65ad4')
//     }).toArray()
// }).then((result) => {
//     console.log(JSON.stringify(result, undefined, 2))
// }).catch((reason) => {
//     console.log('Failure:  ', reason)
// })

MongoClient.connect('mongodb://localhost:27017')
.then((client) => {
    const db = client.db('TodoApp')
    
    return db.collection('Todos').find({
        //_id: new ObjectID('5be01a28df1e0a2becf65ad4')
    }).count()
}).then((result) => {
    console.log(JSON.stringify(result, undefined, 2))
}).catch((reason) => {
    console.log('Failure:  ', reason)
})
