/********************SERVER INIT*********************/

const express = require('express');

const app = express();

const bodyParser = require('body-parser');

// const async = require('async');

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

app.post('/uploaded',(req, res) => {
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
   });

   connection.query('INSERT INTO Workfiles(Filename) VALUES(?)',
       [work_name], (err) => {
          if (err) {
             console.log(err);

             if (err.code == 1062) {
                return res.status(409).send('Файл с таким именем уже существует');
             }
             return res.status(409).send(err.message);
          }
       });

   console.log(work_name);

   res.status(200).send('Файл успешно добавлен в базу данных и загружен на сервер');
});

app.get('/uploaded', (req, res) => {
   res.redirect('/');
});

app.get('/works', (req, res) => {

   connection.query('SELECT * FROM Workfiles ORDER BY Markscount ASC LIMIT 3',[],
       (err, result, fields) => {
         if (err)
            return res.status(404).send(err.message);

         var resdata = []; // RESPONSE DATA ARRAY

         var workfiles = JSON.parse(JSON.stringify(result));

         bake().then(()=> res.contentType('application/json').status(200).
            send(JSON.stringify(resdata)), () => res.status(404).send('Error'));

         async function bake() {

             const promises = workfiles.map( (workfile) => {

                 return new Promise((resolve, reject) => {

                     connection.query('SELECT Mark, Comment FROM Assessments WHERE Fileid = ?',
                         [workfile.Id],
                         (in_err, in_result, in_fields) => {

                             if (in_err)
                                 reject('REJECT'); // NEED TO FIX

                             const marksdata = JSON.parse(JSON.stringify(in_result));

                             resdata.push({'Filename': workfile.Filename, 'Reference' : __dirname + '\\uploaded\\' +
                                     workfile.Filename, 'Marksdata' : marksdata});

                             resolve('SUCCESS');
                         });

                 });

             });
             await Promise.all(promises);
         }

       });

});

app.get('/prepare.js',(req, res) =>
    res.sendFile(__dirname + '/prepare.js')
);

app.get('/uploaded/:filename',(req,res) => {
   res.sendFile(__dirname + /uploaded/ + req.params.filename);
});

app.post('/mark',(req, res) => {

    connection.query('INSERT INTO Assessments(Mark,Comment) VALUES(?,?)',
        [req.body.mark, req.body.comment], (err) => {
            if (err) {
                console.log(err);

                if (err.code == 1062) {
                    return res.status(409).send('Ошибка');
                }
                return res.status(204).send();
            }
        });
});
