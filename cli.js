// скрипт загружается заново каждый раз при загрузке главной страницы
var alreadyMarked = [];

var currentFileid;

function requestForFilenames() {

        var xreq = new XMLHttpRequest();

        xreq.open('GET','/works',false);

        xreq.send();

        if (xreq.response) {

                var data = JSON.parse(xreq.responseText);

                addTask(data);

        } else {
                alert('Не удалось получить работы');
        }
}

function addTask(data) {

        hideElement(document.getElementById("uploader"));

        hideElement(document.getElementById("wb"));

        showElement(document.getElementById("task"));

        let i = 0;

        data.forEach((element) => {

                document.getElementById("work" + i).innerHTML = element.Filename;

                document.getElementById("work" + i).setAttribute('data-fileid', element.Id);

                showElement(document.getElementById("work" + i));

                document.getElementById("work" + i).href = "/uploaded/" + element.Filename;

                i++;

        });
}

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

                        } else {

                                ResponseResultShow(xreq.responseText, false);

                        }
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

        while (parentNode.firstChild) {
                parentNode.removeChild(parentNode.firstChild);
        }

        hideElement(parentNode);

}

// установка идентификатора текущего файла на проверке
// данные хранятся в дополнительном аттрибуте data-fileid выбранной ссылки
function SetCurrentFileid(areference) {

        ClearMarks();

        currentFileid = areference.getAttribute('data-fileid');

        hideElement(document.getElementById("markform"));

        document.getElementById("fileid").value = currentFileid;

        enable(document.getElementById("allmarksbutton"));

        if (!alreadyMarked.includes(currentFileid))

                enable(document.getElementById("markbutton"));

        else

                disable(document.getElementById("markbutton"));

}

function ResponseResultShow(text, success = true) {

        var resplabel = document.getElementById("retext");

        if (success)
                resplabel.style.backgroundColor = "limegreen";
        else {
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
function Send(form, url) {

        var data = new FormData(form);

        var xreq = new XMLHttpRequest();

        var requestHandler = function() {

                if (xreq.readyState === 4) {

                        if (xreq.status === 200) {

                                if (form.id === "markform") {

                                        alreadyMarked.push(form.fileid.value);

                                        hideElement(form);

                                }

                                form.reset();

                                ResponseResultShow(xreq.responseText);

                        } else {

                                ResponseResultShow(xreq.responseText, false);

                        }
                }

        }

        xreq.open('POST',url, true);

        xreq.onreadystatechange = requestHandler;

        xreq.send(data);
}