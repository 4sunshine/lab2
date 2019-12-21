function requestForFilenames() {

        var xreq = new XMLHttpRequest();

        xreq.open('GET','/works',false);

        xreq.send();

        if (xreq.response)
        {
                var data = JSON.parse(xreq.responseText);

                document.getElementById("wb").style.display = "none";

                document.getElementById("uploader").style.display= "none";

                addContent(data);
        }

        else
        {
                // data = [];

                alert('Не удалось получить работы');
        }

}

function addContent(data) {

        let i = 0;

        var div = document.createElement("div");

        div.innerHTML = '<div class="container" id="radiodiv" ></div>';

        document.getElementById("task").appendChild(div);

        data.forEach((element) => {
/*
                var work = document.createElement("p");

                work.innerHTML =
                    `<p><input type="radio" name="workname" id="${element.Filename}"\
                        value="${element.Filename}"> ${element.Filename}</p>`;

                div.appendChild(work);
*/
                var work = document.createElement("p");

                work.innerHTML =
                    `<p><a target="workwindow" href="/uploaded/${element.Filename}">${element.Filename}</a></p>`;

                });

                div.appendChild(work);

                i++;
        });

        document.getElementById(data[0].Filename).checked = true;

        var buttons = document.createElement("p");

        buttons.innerHTML =
            '<p><button id = "showmarks" onclick="showMarks()" type="button">Показать оценки и комментарии</button>' +
            '<button id = "showfile" onclick="showWork()" type="button">Оценить работу</button></p>';

        div.appendChild(buttons);

}

function showMarks() {

        document.getElementById("showmarks").innerHTML =
            document.querySelector('input[name="workname"]:checked').value;

}

function showWork() {
        document.getElementById("workwindow").style.visibility = "visible";
}

function hideMarks() {

}

function hideWork() {

}