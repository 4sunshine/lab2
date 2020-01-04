// скрипт загружается заново каждый раз при загрузке главной страницы
var alreadyMarked = [];
var currentFileid;

function requestForFilenames() {
        //формирование http запроса
        let xreq = new XMLHttpRequest();
        //запрос на получение 3х работ
        xreq.open('GET','/works',false);
        xreq.send();
        if (xreq.response) {
                var data = JSON.parse(xreq.responseText);
                addTask(data);
        } else
                //предупреждение
                alert('Не удалось получить работы');
}

//формируем три ссылки на работы
function addTask(data) {
        hideElement(document.getElementById("uploader"));
        hideElement(document.getElementById("wb"));
        showElement(document.getElementById("task"));
        let i = 0;
        data.forEach((element) => {
                var workElem  =  document.getElementById("work" + i);
                workElem.innerHTML = element.Filename;
                workElem.setAttribute('data-fileid', element.Id);
                showElement(workElem);
                workElem.href = "/uploaded/" + element.Filename;
                i++;
        });
}

//спрятать элемент
function hideElement(element) {
        element.style.display = "none";
}

function showElement(element) {
        element.style.display = "block";
        element.style.visibility = "visible";
}

function disable(element) {
        element.disabled = true;
}

//сделать элемент активным
function enable(element) {
        element.disabled = false;
}

function showMarks() {
        ClearMarks();
        var xreq = new XMLHttpRequest();
        var requestHandler = function() {
                if (xreq.readyState === 4) {
                        if (xreq.status === 200) {
                                var data = JSON.parse(xreq.responseText);
                                data.forEach((element) => {
                                        CreateMarkAndComment(element.Mark, element.Comment);
                                });
                                showElement(document.getElementById("allmarks"));
                                ResponseResultShow("Оценки получены");
                        } else ResponseResultShow(xreq.responseText, false);
                }
        }
        xreq.open('GET', '/mark/' + currentFileid, true);
        xreq.onreadystatechange = requestHandler;
        xreq.send();
}

function CreateMarkAndComment(mark, comment) {
        var parentNode = document.getElementById("allmarks");
        var nodemark = document.createElement("h3");
        nodemark.innerText = mark;
        parentNode.appendChild(nodemark);
        var nodep = document.createElement("p");
        nodep.innerText = comment;
        parentNode.appendChild(nodep);
}

function ClearMarks() {
        var parentNode = document.getElementById("allmarks");
        while (parentNode.firstChild)
                parentNode.removeChild(parentNode.firstChild);
        hideElement(parentNode);
}

// установка идентификатора текущего файла на проверке
// данные хранятся в дополнительном аттрибуте data-fileid выбранной ссылки
function SetCurrentFileid(areference) {
        ClearMarks();
        hideElement(document.getElementById("markform"));
        currentFileid = areference.getAttribute('data-fileid');
        document.getElementById("fileid").value = currentFileid;
        //разблокируем просмотр всех оценок
        enable(document.getElementById("allmarksbutton"));
        if (alreadyMarked.includes(currentFileid))
                disable(document.getElementById("markbutton"));
        else
                enable(document.getElementById("markbutton"));
}

function ResponseResultShow(text, success = true) {
        var resplabel = document.getElementById("retext");
        if (success)
                resplabel.style.backgroundColor = "limegreen";
        else {
                //предупреждение
                alert(text);
                resplabel.style.backgroundColor = "red";
        }
        resplabel.innerHTML = text;
        setTimeout(clearText, 2500);
        function clearText() {
                resplabel.innerText = "";
        }
}

//сброс значений формы с оценкой и комментарием после их принятия на отправку
//Post файла и оценок с комментариями
function Send(form, url) {
        var data = new FormData(form);
        var xreq = new XMLHttpRequest();
        var requestHandler = function() {
                //данные полностью получены сервером - 4
                if (xreq.readyState === 4) {
                        if (xreq.status === 200) {
                                if (form.id === "markform") {
                                        alreadyMarked.push(form.fileid.value);
                                        hideElement(form);
                                }
                                //очистка полей формы
                                form.reset();
                                ResponseResultShow(xreq.responseText);
                        } else  ResponseResultShow(xreq.responseText, false);
                }
        }
        //асинхронная обработка запроса
        xreq.open('POST',url,true);
        //обработчик собятия изменения статуса запроса
        //onreadystatechange
        xreq.onreadystatechange = requestHandler;
        //отправка запроса на сервер
        xreq.send(data);
}