const express = require ('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pg = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'pippa',
    password : '',
    database : 'postgres'
  }  
});
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/profiles', (req, res) => {
  pg('profiles').select().returning('*').then(data => {
    console.log(data);
    res.json(data);
  })
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

app.listen(3006, () => {
  console.log('app is runing on port 3006')
})