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
          .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
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
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
              expect(res.body.todos.length).toBe(1)
          })
          .end(done)
    })
})


describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
          .get('/todos/' + todos[0]._id.toHexString())
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.text).toBe(todos[0].text)
          })
          .end(done)
    })

    it('should not return todo doc created by other user', (done) => {
        request(app)
          .get('/todos/' + todos[1]._id.toHexString())
          .set('x-auth', users[0].tokens[0].token)
          .expect(404)
          .end(done)
    })

    it('should return 404 if todo not found', (done) => {
        request(app)
          .get('/todos/' + (new ObjectID()).toHexString())
          .set('x-auth', users[0].tokens[0].token)
          .expect(404)
          .end(done)
    })

    it('should return 404 if non-object ID', (done) => {
        request(app)
          .get('/todos/123')
          .set('x-auth', users[0].tokens[0].token)
          .expect(404)
          .end(done)
    })
})

describe('DELETE /todos/:id', () => {
    it('should delete todo doc', (done) => {
        const hexId = todos[1]._id.toHexString()
        request(app)
          .delete('/todos/' + hexId)
          .set('x-auth', users[1].tokens[0].token)
          .expect(200)
          .expect((res) => {
              expect(res.body.todo._id).toBe(hexId)
          })
          .end((err, res) => {
              if (err) {
                  done(err)
              }
              Todo.findById(hexId).then((todo) => {
                expect(todo).toBeFalsy()
                done()
              })
              .catch((e) => done(e))
          })
    })

    it('should note delete todo doc of other user', (done) => {
        const hexId = todos[0]._id.toHexString()
        request(app)
          .delete('/todos/' + hexId)
          .set('x-auth', users[1].tokens[0].token)
          .expect(404)
          .end((err, res) => {
            if (err) {
                done(err)
            }
            Todo.findById(hexId).then((todo) => {
              expect(todo).toBeTruthy()
              done()
            })
            .catch((e) => done(e))
        })
    })

    it('should return 404 if todo not found', (done) => {
        request(app)
          .delete('/todos/' + (new ObjectID()).toHexString())
          .set('x-auth', users[0].tokens[0].token)
          .expect(404)
          .end(done)
    })

    it('should return 404 if non-object ID', (done) => {
        request(app)
          .delete('/todos/123')
          .set('x-auth', users[0].tokens[0].token)
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
          .set('x-auth', users[0].tokens[0].token)
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

    it('should not update todo doc of the other user', (done) => {
        const hexId = todos[1]._id.toHexString()
        const newText = 'Updated Dummy Doc 1'
        request(app)
          .patch('/todos/' + hexId)
          .set('x-auth', users[0].tokens[0].token)
          .send({
              text : newText,
              completed: true
          })
          .expect(404)
          .end(done)
    })

    it('should clear completedAt when todo is not completed', (done) => {
        const hexId = todos[1]._id.toHexString()
        const newText = 'Updated Dummy Doc 2'
        request(app)
          .patch('/todos/' + hexId)
          .set('x-auth', users[1].tokens[0].token)
          .send({
              text : newText,
              completed: false
          })
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.text).toBe(newText)
              expect(res.body.todo.completed).toBe(false)
              expect(res.body.todo.completedAt).toBeFalsy()
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
            expect(res.headers['x-auth']).toBeTruthy()
            expect(res.body._id.length).toBeTruthy()
            expect(res.body.email).toBe(email)
        })
        .end((err) => {
            if (err) {
                return done(err)
            }
            User.findOne({email}).then((user) => {
                expect(user).toBeTruthy()
                expect(user.password).not.toBe(password)
                done()
            }).catch((e) => done(e))
        })
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
        .end(done)        
    })
})


describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        const {email, password} = users[1]
        request(app)
        .post('/users/login')
        .send({email, password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeTruthy()
        })
        .end((err, res) => {
            if (err) {
                return done(err)
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.toObject().tokens[1]).toMatchObject({
                    access: 'auth',
                    token: res.headers['x-auth']
                })
                done()
            }).catch((e) => done(e))   
        })
    })

    it('should reject invalid login', (done) => {
        const {email} = users[1]
        const password = 'bullshit'
        request(app)
        .post('/users/login')
        .send({email, password})
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeFalsy()
        })
        .end((err, res) => {
            if (err) {
                return done(err)
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toBe(1)
                done()
            }).catch((e) => done(e))   
        })       
    })
})

describe('DELETE /users/me/token', () => {
    it('should delete the token from a user', (done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if (err) {
                return done(err)
            }
            User.findById(users[0]._id).then((user) => {
                expect(user.tokens.length).toBe(0)
                done()
            }).catch((e) => done(e))
        })        
    })
})