/********************SERVER INIT START*********************/

const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const port = 8080;

const fileUpload = require('express-fileupload');

app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

/*<<<<<<<<<<<<<     SQL settings init   >>>>>>>>>>>>>>>>>>>*/

const db = require('mysql');

const fs = require('fs');

const sqlConfig = JSON.parse(fs.readFileSync(__dirname + '/sqlconfig.json','UTF-8'));

const connection = db.createConnection(sqlConfig);

connection.connect((err) => {
   if (err) {
      console.log(err);
      return;
   }
   else
      console.log("SQL server connection established");
});

// ${port} error must be fixed
app.listen(port, () => console.log('DataServer is listening on port: ${port}.'));

/********************SERVER INIT END*********************/

/*******************REST API START***********************/

// GET LOCALHOST:8080
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html')
});

app.post('/uploaded',(req, res) =>
{
   if (!req.files || (Object.keys(req.files).length === 0)) {
      return res.status(400).send('Файл не был загружен!');
   }

   let work = req.files.workfile;

   //************* GET FILENAME WITHOUT EXTENSION ****************/

   let work_ext = work.name.split('.').pop(); // GETTING EXTENSION

   let work_name = work.name; // WORK NAME ON SERVER

   let regex = new RegExp("." + work_ext, "i"); // REGULAR EXPRESSION FOR EXTENSION

   // CHECK IF NAME CONTAINS NO EXTENSION

   if (work_name != work_ext)
      work_name = work_name.replace(regex, "");
   else
      work_ext = "";

   // TO AVOID NAME CONFLICTS ADD TIMESTAMP TO FILENAME

   var date = new Date();

   work_name += "_" + date.getFullYear() + (date.getMonth() + 1) + date.getDate()
       + "_" + date.getHours() + date.getMinutes() + date.getSeconds() + "_" + date.getMilliseconds()
         + "." + work_ext;

   // STORE UPLOADED FILE IN /uploaded/ FOLDER :

   work.mv(__dirname + '/uploaded/' + work_name,(err) => {
      if (err)
         return res.status(500).send('Ошибка при загрузке на сервер');

      res.send("Файл успешно загружен!");
   });

   console.log(work_name);

});

app.get('/uploaded', (req, res) => {
   res.sendFile(__dirname + '/index.html');
});


