window.onload = function() {
    var dataset = document.getElementById("dataset");
    dataset.addEventListener("click", addObservation);
    document.getElementById("download").addEventListener("click", download);
    drawCrosshair(dataset.width / 2, dataset.height / 2);
    document.getElementsByClassName('remove')[0].addEventListener("click", remove);
};

function addObservation(event) {
    document.getElementById("csv").innerHTML += "<tr><td>" + position(event.pageX) + "</td><td>" + inversePosition(event.pageY) + "</td><td><button class=\"remove\" />Remove the observation</td></tr>";
    for (var i = 0; i < document.getElementsByClassName('remove').length; i++) {
        document.getElementsByClassName('remove')[i].addEventListener("click", remove);
    }
    drawCrosshair(event.pageX, event.pageY);
}

function closest(elem, selector) {
    for ( ; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode) {
        if (elem.tagName.toLowerCase() === selector) {
            return elem;
        }
    }

    return null;
}

function download() {
    var csvContent = "";
    for (var i = 0; i < document.getElementById("csv").rows.length; i++) {
        if (document.getElementById("csv").rows[i].innerHTML !== "") {
            var coordinates = xAndY(document.getElementById("csv").rows[i].innerHTML);
            csvContent += coordinates[0] + ", " + coordinates[1] + "\n";
        }
    }

    var link = document.createElement("a");
    link.target = "_blank";
    link.href = "data:text/plain," + encodeURIComponent(csvContent);
    link.click(); // This will download the data file named "my_data.csv".
}

function drawCrosshair(x, y) {
    var context = document.getElementById("dataset").getContext("2d");
    context.beginPath();
    context.moveTo(x - 7, y);
    context.lineTo(x + 7, y);
    context.moveTo(x, y - 7);
    context.lineTo(x, y + 7);
    context.stroke();
}

function getCount(parent){
    var relevantChildren = 0;
    var children = parent.childNodes.length;
    for(var i=0; i < children; i++){
        if (parent.childNodes[i].nodeType != 3){
            relevantChildren++;
        }
    }
    return relevantChildren;
}

function redrawCanvas() {
    document.getElementById("dataset").getContext("2d").clearRect(0, 0, document.getElementById("dataset").width, document.getElementById("dataset").height);
    var context = document.getElementById("dataset").getContext("2d");
    for (var i = 0; i < document.getElementById("csv").rows.length; i++) {
        if (document.getElementById("csv").rows[i].innerHTML !== "") {
            var coordinates = xAndY(document.getElementById("csv").rows[i].innerHTML);

            var x = observation(parseFloat(coordinates[0]));
            var y = inverseObservation(parseFloat(coordinates[1]));
            drawCrosshair(x, y);
        }
    }
}

function remove(event) {
    document.getElementById("csv").innerHTML = document.getElementById("csv").innerHTML.replace(closest(event.target, "tr").innerHTML, "");
    for (var i = 0; i < document.getElementsByClassName('remove').length; i++) {
        document.getElementsByClassName('remove')[i].addEventListener("click", remove);
    }
    redrawCanvas();
}

function xAndY(row) {
    var positionX = row.substring(row.indexOf("<td>") + 4, row.indexOf("</td>"));
    row = row.substring(row.indexOf("</td>") + 5);
    var positionY = row.substring(row.indexOf("<td>") + 4, row.indexOf("</td>"));

    return [positionX, positionY];
}

function position(observation) {
    return observation / document.getElementById("dataset").width;
}

function inversePosition(observation) {
    return 1 - observation / document.getElementById("dataset").width;
}

function observation(position) {
    return position * document.getElementById("dataset").width;
}

function inverseObservation(position) {
    return document.getElementById("dataset").width - position * document.getElementById("dataset").width;
}
