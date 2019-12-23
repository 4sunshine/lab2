/******************** НАСТРОЙКИ СЕРВЕРА *********************/

//подключение внешнего модуля express для обработки запросов
const express = require('express');

//инициализация внешнего модуля express
const app = express();

//подключение внешнего модуля body-parser - парсер http запроса
//парсирование - выделение объектов из строки
const bodyParser = require('body-parser');

//порт сервера
const port = 8080;

//подключение внешнего модуля express-fileupload - обработчик загрузки файлов
const fileUpload = require('express-fileupload');

//добавляем промежуточный обработчик загрузки файлов
app.use(fileUpload());

//добавляем промежуточный обработчик парсирования URL
app.use(bodyParser.urlencoded({ extended: true }));

//добавляем промежуточный обработчик парсирования json файлов
app.use(bodyParser.json());

/******************** НАСТРОЙКИ СЕРВЕРА SQL *********************/

//подключение внешнего модуля mysql для работы с СУБД MySQL
const db = require('mysql');

//подключение внешнего модуля fs для выполнения операций с элементами файловой системы
const fs = require('fs');

//чтение и парсинг файла конфигурации соединения с  MySQL - sqlconfig.json. Где __dirname - корневая дирректория
const sqlConfig = JSON.parse(fs.readFileSync(__dirname + '/sqlconfig.json','UTF-8'));

//установка соединения сервера с MySQL. В качестве переметров передается файл конфигурации соединения.
const connection = db.createConnection(sqlConfig);

//проверка возможсти установки прямого соединения с MySQL
connection.connect((err) => {
   if (err) {
      console.log(err);
      return;
   }
   else
      console.log("SQL server connection established");
});

//запуск прослушки порта
app.listen(port, () => console.log('DataServer is listening on port: ' + port));

/************** ЗАВЕРШЕНИЕ НАСТРОЙКИ СЕРВЕРА *****************/

/*********************** REST API ****************************/
//определение ресурсов и методов доступа к ним
//Rest API Каждый «объект» однозначно описывается своим url
//обработка обащения к домашней странице -  GET LOCALHOST:8080
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html')
});

//обработка загрузки файлов на сервер
app.post('/uploaded',(req, res) => {

    if (!req.files || (Object.keys(req.files).length === 0)) {
        return res.status(400).send('Файл не был загружен!');
    }

    let work_name = req.files.workfile.name;

    connection.query('INSERT INTO Workfiles(Filename) VALUES(?)', [work_name], (err) => {

        if (err)
            return res.status(409).send('Ошибка загрузки файла в базу данных. Попробуйте переименовать файл.');

        req.files.workfile.mv(__dirname + '/uploaded/' + work_name, (_err) => {

            if (_err)
                return res.status(500).send('Ошибка при загрузке на сервер');

            return res.status(200).send('Файл успешно добавлен в базу данных и загружен на сервер');

        });

    });

});

//перенаправление на главную страницу
app.get('/uploaded', (req, res) => {
   res.redirect('/');
});

app.get('/works', (req, res) => {

   connection.query('SELECT * FROM Workfiles ORDER BY Markscount ASC LIMIT 3',[],
       (err, result) => {
         if (err)
            return res.status(404).send(err.message);

         return res.contentType('application/json').status(200).send(JSON.stringify(result));

         /////////////////////////////////////////////////////////////////////////////////////

         let resdata = []; // RESPONSE DATA ARRAY

         let workfiles = JSON.parse(JSON.stringify(result));

         console.log(workfiles);



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

app.get('/cli.js',(req, res) => {
    res.sendFile(__dirname + '/cli.js')
});

app.get('/uploaded/:filename',(req,res) => {
   res.sendFile(__dirname + /uploaded/ + req.params.filename);
});

app.post('/mark',(req, res) => {

    connection.query('INSERT INTO Assessments(Fileid,Mark,Comment) VALUES(?,?,?)',
        [req.body.fileid, req.body.mark, req.body.comment], (err) => {
            if (err) {
                return res.status(409).send('Ошибка загрузки оценки в базу данных!');
            }

            // увеличиваем число оценок, выставленных работе, на 1
            connection.query('UPDATE Workfiles SET Markscount = Markscount + 1 WHERE Id = ?',
                [req.body.fileid], (_err) => {
                if (_err) {
                    // второй запрос к базе данных - возможны ошибки в подсчёте оценок
                    // например при разрыве соединения
                    return res.status(409).send('Ошибка подсчёта числа оценок!');
                }

                return res.status(200).send('Оценка выставлена успешно!');
            });
    });
});
