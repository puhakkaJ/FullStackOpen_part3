const express = require('express')
//const http = require('http')
const cors = require('cors')

var morgan = require('morgan')
const app = express()

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }
  
  morgan.token('type', (request, response) => {
    const body = JSON.stringify(request.body)
    return body
  })

app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :type"))
app.use(cors())
app.use(express.static('build'))

let persons = [
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
    title: `Phonebook has info for ${persons.length} people`,
    date: new Date()
    }
]



app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(
        `<p>${info[0].title}</p>
         <p>${info[0].date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    response.json(person)

    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number cannot be missing' 
    })
  }

  if (persons.map(person => person.name).includes(body.name)) {
    return response.status(400).json({ 
      error: 'name is already in the phonebook' 
    })
  }

  const person = {
    id: Math.floor(Math.random() * 2000),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
  })

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })