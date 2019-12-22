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

function updateWorkName(filename) {
        document.getElementById("workname").value = filename;

        enable(document.getElementById("markbutton"));

        enable(document.getElementById("allmarksbutton"));
}

//очистка уведомления iframe
function clearFrame(frame) {
        try {
                //содержимое документа iframe 1ая строка - Chrome, 2ая - IE
                //дял пустых iframe выдаёт ошибку чтения contentDocument
                const content = frame.contentDocument.documentElement.innerText ||
                    frame.window.contentDocument.documentElement.innerText;

                if (content) {
                        setTimeout(f, 2000);

                        function f() {
                                frame.src = "about:blank";
                        }
                }
        }
        catch (e) {}
}