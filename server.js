const express = require ('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const yaml = require('js-yaml');
const fs   = require('fs');

const pg = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '',
    database : 'postgres'
  }  
});
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/profiles', (req, res) => {
  pg('profiles').select().orderBy('name')
    .then(data => res.json(data))
    .catch(err => res.status(500).json(err))
});

app.post('/profiles', (req, res) => {
  pg('profiles').insert({name: req.body.name, info: JSON.stringify(req.body)})
    .then(data => res.json('success'))
    .catch(err => res.status(500).json(err));
});

app.put('/profiles', (req, res) => {
  pg('profiles').where('name', '=', req.body.name).update('info', JSON.stringify(req.body))
    .then(data => res.json('success'))
    .catch(err => res.status(500).json(err));
});

app.delete('/profiles/:name', (req, res) => {
  pg('profiles').where('name', req.params.name).del()
      .then(data => res.json('success'))
      .catch(err => res.status(500).json(err));
});

app.get('/resources', (req, res) => {
  pg('resources').select('info').select('protocol').orderBy('name')
      .then(data => {
        return res.json(data)
      })
      .catch(err => res.status(500).json(err))
});

app.post('/resources/:protocol', (req, res) => {
  pg('resources').insert({name: req.body.name, info: JSON.stringify(req.body), protocol: req.params.protocol})
    .then(data => res.json('success'))
    .catch(err => res.status(500).json(err));
});

app.put('/resources', (req, res) => {
  pg('resources').where('name', '=', req.body.name).update('info', JSON.stringify(req.body))
    .then(data => res.json('success'))
    .catch(err => res.status(500).json(err));
});

app.delete('/resources/:name', (req, res) => {
  pg('resources').where('name', req.params.name).del()
      .then(data => {
        res.json('success')})
      .catch(err => res.status(500).json(err));
});

app.listen(3006, () => {
  console.log('app is runing on port 3006')
})