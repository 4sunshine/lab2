function requestForFilenames() {

        var xreq = new XMLHttpRequest();

        xreq.open('GET','/works',false);

        xreq.send();

        document.getElementById("wb").style.display="none";

        document.getElementById("uploader").style.display="none";

        var data = JSON.parse(xreq.responseText);

        addContent(data);
}

function addContent(data) {
        var ul = document.createElement("ul");

        ul.innerHTML = `<ul id="worklists"></ul>`;

        document.getElementById("task").appendChild(ul);

        let i = 0;

        data.forEach((element) => {

                var li = document.createElement("li");

                li.innerHTML = `<li id="work${i}">${element.Filename}</li>`;

                i++;

                ul.appendChild(li);

                document.getElementById("worklists").appendChild(li);
        });
}