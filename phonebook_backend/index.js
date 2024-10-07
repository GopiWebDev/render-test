require('dotenv').config();
const morgan = require('morgan');
const express = require('express');

const app = express();
app.use(express.static('dist'));
app.use(express.json());
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

const Person = require('./models/person');

morgan.token('body', (req) => JSON.stringify(req.body));

app.get('/info', (request, response) => {
  const length = Person.length;
  const time = new Date();

  return response.send(
    `
    <p>Phonebook has info for ${length} person</p>
    <p>${time.toString()}</p>
   `
  );
});

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((person) => {
      response.json(person);
    })
    .catch((err) => next(err));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) response.json(person);
      else response.status(404).end;
    })
    .catch((err) => next(err));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((err) => next(err));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'name is missing',
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number is missing',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((err) => next(err));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((err) => next(err));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const PORT = process.env.PORT;
app.listen(PORT);
app.use(errorHandler);
