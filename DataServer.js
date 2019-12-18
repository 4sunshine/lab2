const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const port = 8080;

const db = require('mysql');
//var connection = db.createConnection()

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());


app.get('/', (req, res) =>
{
   //res.send('hello i am server on port: ${port}')
   res.sendFile('index.html')
});

// ${port} error must be fixed
app.listen(port, () => console.log('DataServer is listening on port: ${port}.'));

