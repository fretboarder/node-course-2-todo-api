const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('../server')
const {Todo} = require('../models/todo')
const {User} = require('../models/user')
const {populateTodos, todos, populateUsers, users} = require('./seed/seed')


beforeEach(populateUsers)
beforeEach(populateTodos)



describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Test todo text'

        request(app)
          .post('/todos')
          .send({
              text
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.text).toBe(text)
          })
          .end((err,res) => {
              if (err) {
                  return done(err)
              }

              Todo.find({text}).then((todos) => {
                  expect(todos.length).toBe(1)
                  expect(todos[0].text).toBe(text)
                  done()
              }).catch((e) => done(e))
          })
    })

    it('should not create todo with invalid body data', (done) => {
        request(app)
          .post('/todos')
          .send({})
          .expect(400)
          .end((err,res) => {
              if (err) {
                  return done(err)
              }
              Todo.find().then((todos) => {
                  expect(todos.length).toBe(2)
                  done()
              }).catch((e) => done(e))
          })        
    })
})

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
          .get('/todos')
          .expect(200)
          .expect((res) => {
              expect(res.body.todos.length).toBe(2)
          })
          .end(done)
    })
})


describe('GET /todos/:id', () => {
    it('should get todo doc', (done) => {
        request(app)
          .get('/todos/' + todos[0]._id.toHexString())
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.text).toBe(todos[0].text)
          })
          .end(done)
    })

    it('should return 404 if todo not found', (done) => {
        request(app)
          .get('/todos/' + (new ObjectID()).toHexString())
          .expect(404)
          .end(done)
    })

    it('should return 404 if non-object ID', (done) => {
        request(app)
          .get('/todos/123')
          .expect(404)
          .end(done)
    })
})

describe('DELETE /todos/:id', () => {
    it('should delete todo doc', (done) => {
        const hexId = todos[1]._id.toHexString()
        request(app)
          .delete('/todos/' + hexId)
          .expect(200)
          .expect((res) => {
              expect(res.body.todo._id).toBe(hexId)
          })
          .end((err, res) => {
              if (err) {
                  done(err)
              }
              Todo.findById(hexId).then((todo) => {
                expect(todo).toNotExist
                done()
              })
              .catch((e) => done(e))

            //   Todo.find().then((todos) => {
            //     expect(todos.length).toBe(todos.length -)
            //     done()
            //   })
            //   .catch((e) => done(e))
          })
    })

    it('should return 404 if todo not found', (done) => {
        request(app)
          .delete('/todos/' + (new ObjectID()).toHexString())
          .expect(404)
          .end(done)
    })

    it('should return 404 if non-object ID', (done) => {
        request(app)
          .delete('/todos/123')
          .expect(404)
          .end(done)
    })    
})

describe('PATCH /todos/:id', () => {
    it('should update todo doc', (done) => {
        const hexId = todos[0]._id.toHexString()
        const newText = 'Updated Dummy Doc 1'
        request(app)
          .patch('/todos/' + hexId)
          .send({
              text : newText,
              completed: true
          })
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.text).toBe(newText)
              expect(res.body.todo.completed).toBe(true)
              expect(typeof res.body.todo.completedAt).toBe('number')
          })
          .end(done)
    })

    it('should clear completedAt when todo is not completed', (done) => {
        const hexId = todos[1]._id.toHexString()
        const newText = 'Updated Dummy Doc 2'
        request(app)
          .patch('/todos/' + hexId)
          .send({
              text : newText,
              completed: false
          })
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.text).toBe(newText)
              expect(res.body.todo.completed).toBe(false)
              expect(res.body.todo.completedAt).toBeNull()
          })
          .end(done)
    })
})


describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString())
            expect(res.body.email).toBe(users[0].email)
        })
        .end(done)
    })

    it('should return 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({})
        })
        .end(done)
    })
})

describe('POST /users', () => {
    it('should create a user', (done) => {
        const email = 'example@example.com'
        const password = '123abc'

        request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth'].length).toBeTruthy()
            expect(res.body._id.length).toBeTruthy()
            expect(res.body.email).toBe(email)
        })
        .end(done)
    })

    it('should return validation errors if request invalid', (done) => {
        const email = 'notanemailaddress'
        const password = '123'
        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done)
    })

    it('should not create user if email in use', (done) => {
        const email = users[0].email
        const password = '123abc'
        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done())        
    })
})