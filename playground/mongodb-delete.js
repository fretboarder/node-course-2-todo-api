//const MongoClient = require('mongodb').MongoClient

// ES6 De-Structuring
const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017')
.then((client) => {
    const db = client.db('TodoApp')
    
    // return db.collection('Todos').deleteMany({
    //     text: 'Eat lunch'
    // })
    // return db.collection('Todos').deleteOne({
        // text: 'Eat lunch'
    // })
    return db.collection('Users').findOneAndDelete({
        name: 'Pfustler'
    })

}).then((result) => {
    console.log('Result: ', JSON.stringify(result, undefined, 4))
}).catch((reason) => {
    console.log('Failure:  ', reason)
})
