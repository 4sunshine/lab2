function requestForFilenames() {

        var xreq = new XMLHttpRequest();

        xreq.open('GET','/works',false);

        xreq.send();

        if (xreq.response) {
                var data = JSON.parse(xreq.responseText);

                ResponseResultShow(xreq.responseText);

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

                document.getElementById("work" + i).style.visibility = 'visible';

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

}

// установка идентификатора текущего файла на проверке
// данные хранятся в дополнительном аттрибуте data-fileid выбранной ссылки
function SetCurrentFileid(areference) {
        document.getElementById("fileid").value = areference.getAttribute('data-fileid');

        enable(document.getElementById("markbutton"));

        enable(document.getElementById("allmarksbutton"));
}

function ResponseResultShow(text, success = true) {

        alert('in');

        var resplabel = document.getElementById("retext");

        if (success)
                resplabel.style.backgroundColor = "limegreen";
        else {
                alert(text);

                resplabel.style.backgroundColor = "red";
        }

        resplabel.innerHTML = text;

        setTimeout(f, 2500);

        function f() {
                resplabel.innerText = "";
        }
}

//сброс значений формы с оценкой и комментарием после их принятия на отправку
function SendPost(form, url) {

        let data = new FormData(form);

        let xreq = new XMLHttpRequest();

        xreq.open('POST',url, true);

        xreq.send(data);

        xreq.onload = () => {

                if (xreq.readyState === 4) {

                        if (xreq.status === 200) {

                                ResponseResultShow(xreq.responseText);

                                form.reset();

                        } else {

                                ResponseResultShow(xreq.responseText, false);

                        }
                }
        }
}