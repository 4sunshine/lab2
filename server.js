/******************** НАСТРОЙКИ СЕРВЕРА *********************/
//подключение внешнего модуля express для обработки запросов
//Позволяет определить обработчики для url, body (авт-е преобразование в объекты JS)
const express = require('express');
//инициализация внешнего модуля express
const app = express();
//подключение модуля body-parser - парсер http запроса
//парсирование - выделение объектов из строки
const bodyParser = require('body-parser');
//подключение модуля express-fileupload - обработчик загрузки файлов
const fileUpload = require('express-fileupload');
//добавляем промежуточный обработчик загрузки файлов
app.use(fileUpload());
//добавляем промежуточный обработчик парсирования URL
app.use(bodyParser.urlencoded({ extended: true }));
//добавляем промежуточный обработчик парсирования json файлов
app.use(bodyParser.json());
/******************** НАСТРОЙКИ SQL *********************/
//подключение внешнего модуля mysql для работы с СУБД MySQL
const db = require('mysql');
//подключение внешнего модуля fs для выполнения операций с элементами файловой системы
const fs = require('fs');

//чтение и парсинг файла конфигурации MySQL - sqlconfig.json. Где __dirname - корневая дирректория
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
      console.log("Соединение с SQL сервером установлено");
});

//определение ресурсов - URL и методов доступа к ним
//Rest API Каждый «объект» однозначно описывается своим url

//обработка обащения к домашней странице - GET LOCALHOST:8080
//req - запрос, res - ответ
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html')
});

//обработка загрузки файлов на сервер
app.post('/uploaded',(req, res) => {
    //если отсутствуют файлы, либо количесвтво ключей файлов = 0
    if (!req.files || (Object.keys(req.files).length === 0)) {
        return res.status(400).send('Файл не был загружен!');
    }
    //имя работы
    let work_name = req.files.workfile.name;
    //запрос к базе данных. Параметры - строка запроса, массив параметров, коды ошибок
    connection.query('INSERT INTO Workfiles(Filename) VALUES(?)', [work_name], (err) => {
        if (err)
            return res.status(409).send('Ошибка загрузки файла в базу данных. Попробуйте переименовать файл');
        //Перемещаем файл в указаннную дирректорию на ПК
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

//запрос на получение работ
app.get('/works', (req, res) => {
   //Сортируем в порядке возрастания и берем первые три работы
   connection.query('SELECT * FROM Workfiles ORDER BY Markscount ASC LIMIT 3',[],
       (err, result) => {
           if (err)
               return res.status(404).send('Ошибка запроса к базе данных');
           //уточняем что ответ сервера приходит в формате JSON
           return res.contentType('application/json').status(200).send(result);
       });
});


//метод загрузки скрипта у клиента
app.get('/client.js',(req, res) => {
    res.sendFile(__dirname + '/client.js')
});

//переход по ссылке
app.get('/uploaded/:filename',(req,res) => {
   res.sendFile(__dirname + /uploaded/ + req.params.filename);
});

app.post('/mark',(req, res) => {
    connection.query('INSERT INTO Grades(Fileid,Mark,Comment) VALUES(?,?,?)',
        [req.body.fileid, req.body.mark, req.body.comment], (err) => {
            if (err) return res.status(409).send('Ошибка загрузки оценки в базу данных!');
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

//В POST запросе параметры передаются в теле функции, в GET - через параметры адресной строки
//GET - Запрашивает данные из указанного ресурса
//POST - Отправка данных для обработки в указанный ресурс
//id - Fileid
app.get('/mark/:id', (req, res) => {
    connection.query('SELECT Mark, Comment FROM Grades WHERE Fileid = ?',
        [req.params.id], (err, result) => {
            if (err)
                res.status(409).send('Не удалось получить оценки для данной работы');
            return res.contentType('application/json').status(200).send(result);
    });
});

//порт сервера
const port = 8080;
//запуск прослушки порта
app.listen(port, () => console.log('Сервер данных прослушивает порт: ' + port));