const express = require('express')
const app = express()
var morgan = require('morgan')
const cors  = require('cors')

app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

app.use(morgan('dev'))

app.use(cors())

app.use(express.static('dist'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456",
      "important": true
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523",
      "important": false
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345",
      "important": false
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122",
      "important": true
    }
]


const date = new Date()
const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const mesesAnio = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

const information = () => {
    return (
        `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${diasSemana[date.getDay()]} ${mesesAnio[date.getMonth()]} ${date.getDate()} ${date.getFullYear()} ${date.toTimeString()}</p>
        `
    )
}

const generateId = () => {
    const newId = persons.length > 0 
        ? Math.max(...persons.map(person => person.id))
        : 0
    return newId + 1
}

app.get('/', (request, response) => {
    response.send('<h1>¡BIENVENIDO A LA AGENDA TELEFÓNICA</h1>')
})

app.get('/api/persons', (request, response) => {
    if (persons.length > 0){
        response.json(persons)
    } else {
        response.send('<h1>No se ha añadido ningún registro</h1>')
    }
})

app.get('/info', (request, response) => {
    response.send(information())
})


app.get('/api/persons/:id', (request, response) => {
    const infoPerson = persons.find(person => person.id === Number(request.params.id))
    if (infoPerson){
        response.json(infoPerson)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    persons = persons.filter(person => person.id !== Number(request.params.id))

    response.status(204).end()
})


app.post('/api/persons', (request, response) => {
    const body = request.body
    const name = body.name
    const numberPhone = body.number

    if (name.trim() === "" || numberPhone.trim() === ""){
        response.status(400).json({
            error:"empty name or phone number"
        })
    } else if (persons.some(person => person.name.trim().toLowerCase() === name.trim().toLowerCase())){
        response.status(400).json({
            error:"name must be unique"
        })
    } else {
        const newPerson = {
            id: generateId(),
            name,
            number: numberPhone
        }
        
        persons = persons.concat(newPerson)
        response.status(201).json(newPerson)
    }

})

app.patch('/api/persons/:id', (request, response) => {
    const index = persons.findIndex(person => person.id === Number(request.params.id))
    if (index === -1){
        return response.status(404).json({error: "Persona no encontrada"})
    }
    const nuevoNumero = request.body.number?.trim()

    if (!nuevoNumero || !/^\d+$/.test(nuevoNumero)) {
        return response.status(400).json({error: "número inválido"})
    }

    persons[index] = {
        ...persons[index],
        number: request.body.number
    }

    response.json({number: request.body.number})
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

