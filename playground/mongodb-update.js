//const MongoClient = require('mongodb').MongoClient

// ES6 De-Structuring
const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017')
.then((client) => {
    const db = client.db('TodoApp')
    
    return db.collection('Users').findOneAndUpdate({
        name: 'Pfustle'
    }, { $set: { name: 'Klaus' },
         $inc: { age: 10 }
    }, {
        returnOriginal: false
    })

}).then((result) => {
    console.log('Result: ', JSON.stringify(result, undefined, 4))
}).catch((reason) => {
    console.log('Failure:  ', reason)
})
