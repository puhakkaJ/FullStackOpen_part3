require('dotenv').config()

const express = require('express')
const app = express()
const Person = require('./models/person')
const cors = require('cors')

const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

var personSchema = mongoose.Schema({
    name: { type: String, minlength: 3, required: true, unique: true },
    number: { type: String, minlength: 8, required: true },
});

// Apply the uniqueValidator plugin to userSchema.
personSchema.plugin(uniqueValidator);

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
    else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
  }
  
    next(error)
  }

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

app.use(requestLogger)

// ÄLÄ KOSKAAN TALLETA SALASANOJA githubiin! MUISTA POISTAA
const url = process.env.MONGODB_URI   
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  
/*const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})*/

let info = [
    {
    date: new Date()
    }
]


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
      })
})

app.get('/info', (request, response) => {
    Person.find({}).then(result => {
      response.send(
        `<p>${`Phonebook has info for ${result.length} people`}</p>
         <p>${info[0].date}</p>`)
      })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
          } else {
            response.status(404).end()
          }
        })
        .catch(error => {
            console.log(error)
            next(error)
        })
  })

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
  })

app.post('/api/persons', (request, response, next) => {
    const body = request.body
  
    if (body.name === undefined || body.number === undefined) {
      return response.status(400).json({ error: 'name or number cannot be missing' })
    }
  
    const person = new Person({
      name: body.name,
      number: body.number,
    })
  
    person.save().then(savedPerson => {
        return savedPerson.toJSON()
    }).then(savedAndFormattedPerson => {
        response.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
  })

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})