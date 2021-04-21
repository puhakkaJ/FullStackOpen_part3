require('dotenv').config()

const express = require('express')
const app = express()

const cors = require('cors')

const mongoose = require('mongoose')
const Person = require('./models/person')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }
  
// ÄLÄ KOSKAAN TALLETA SALASANOJA githubiin! MUISTA POISTAA
const url = process.env.MONGODB_URI   
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
  
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })


app.use(express.json())
//app.use(morgan(":method :url :status :res[content-length] - :response-time ms :type"))
app.use(cors())
app.use(express.static('build'))

let people = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "040-123456",
      //important: true
    },
    {
      id: 2,
      name: "Ada Lovelace",
      number: "39-44-5323523",
      //important: false
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "12-43-234345",
      //important: true
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122",
        //important: true
      }
  ]

let info = [
    {
    title: `Phonebook has info for ${people.length} people`,
    date: new Date()
    }
]



app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
      })
})

app.get('/info', (request, response) => {
    response.send(
        `<p>${info[0].title}</p>
         <p>${info[0].date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      response.json(person)
    })
  })

/*app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = people.find(person => person.id === id)
    response.json(person)

    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })*/

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    people = people.filter(person => person.id !== id)
  
    response.status(204).end()
  })

app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (body.name === undefined || body.number === undefined) {
      return response.status(400).json({ error: 'name or number cannot be missing' })
    }
  
    const person = new Person({
      name: body.name,
      number: body.number,
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})