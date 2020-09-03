const axios = require('axios');
const bcrypt = require('bcryptjs');

const db = require('../database/dbConfig');

const { authenticate, generateToken } = require('./middlewares');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const credentials = req.body;
  const hash = bcrypt.hashSync(credentials.password, 4)

  credentials.password = hash;

  db('users')
    .insert(credentials)
    .then(user => {
      res.status(201).json(user);
    })
    .catch(err => res.json({ message: 'registration failed', err }))
}

function login(req, res) {
  // implement user login
  const credentials = req.body;
  
  db('users')
    .where({ username: credentials.username })
    .first()
    .then(user => {
      if(user && bcrypt.compareSync(credentials.password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ message: "login success", token })
      } else {
        res.status(401).json({ message: "incorrect inputs"})
      }
    })
    .catch(() => res.json({ message: "login fail"}))
}

function getJokes(req, res) {
  axios
    .get('https://safe-falls-22549.herokuapp.com/random_ten')
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
