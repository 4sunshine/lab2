function requestForFilenames() {

        var xreq = new XMLHttpRequest();

        xreq.open('GET','/works',false);

        xreq.send();

        var data = JSON.parse(xreq.responseText);

        if (data) {
                document.getElementById("wb").style.display = "none";

                document.getElementById("uploader").style.display= "none";

                addContent(data);
        }
        else {
                alert('Работы отсутствуют!');
        }

}

function addContent(data) {

        let i = 0;

        var div = document.createElement("div");

        div.innerHTML = '<div class="container" id="radiodiv"></div>';

        document.getElementById("task").appendChild(div);

        data.forEach((element) => {
                var work = document.createElement("p");

                work.innerHTML =
                    `<p><input type="radio" name="workname" id="work${i}"\
                        value="${element.Filename}"> ${element.Filename}</p>`;

                div.appendChild(work);
        });
/*
        var inform = `
        
        `;

        var ul = document.createElement("ul");

        ul.innerHTML = `<ul id="worklists"></ul>`;

        document.getElementById("task").appendChild(ul);

        //let i = 0;

        data.forEach((element) => {

                var li = document.createElement("li");

                li.innerHTML = `<li id="work${i}">${element.Filename}</li>`;

                i++;

                ul.appendChild(li);

                document.getElementById("worklists").appendChild(li);
        });

 */
}