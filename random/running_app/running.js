let boxes;
let allPaces;
let allKms;
let circles;
let curves;

let averagePace;
let currentPaceLine;

let scopes = [];

let canMove;

let distanceElement;
let paceMinutesElement;
let paceSecondsElement;
let timeHoursElement;
let timeMinutesElement;
let timeSecondsElement;

const DEFAULT_MIN_PACE = 4;
const DEFAULT_SEC_PACE = 30;
const DEFAULT_HOUR_TIME = 0;
const DEFAULT_MIN_TIME = 22;
const DEFAULT_SEC_TIME = 30;

function initState(params) {
    boxes = {}
    allPaces = {}
    allKms = {}
    circles = {}
    curves = {}
    averagePace = {}
    currentPaceLine = {}

    for (let i = 0; i < params.rows; i++) {
        boxes[row(i)] = [];
        allPaces[row(i)] = [];
        allKms[row(i)] = [];
        circles[row(i)] = [];
        curves[row(i)] = [];
    }
}

function row(row) {
    return `row_${row}`;
}

function main() {
    distanceElement = document.querySelector("#race-distance");

    paceMinutesElement = document.querySelector("#pace-minutes");
    paceSecondsElement = document.querySelector("#pace-seconds");

    timeHoursElement = document.querySelector("#time-hours");
    timeMinutesElement = document.querySelector("#time-minutes");
    timeSecondsElement = document.querySelector("#time-seconds");

    paceMinutesElement.onchange = onPaceChange;
    paceSecondsElement.onchange = onPaceChange;

    timeHoursElement.onchange = onTimeChange;
    timeMinutesElement.onchange = onTimeChange;
    timeSecondsElement.onchange = onTimeChange;

    distanceElement.onchange = function() {
        renderPacePlanningWidget(getParams());

        setTime(getSelectedPace(), getDistance());
        renderPacePlanningWidget(getParams());
    }

    initState(getParams());

    renderPacePlanningWidget(getParams());
};

function getParams() {
    let availableWidth = document.querySelector("#canvas-holder").clientWidth;

    let selectedDistance = getDistance();
    let segments = Math.ceil(selectedDistance);

    let margin = 30;
    let maxElementsPerLine = Math.ceil(availableWidth / 120);

    let segmentWidth = (availableWidth - 2 * margin) / maxElementsPerLine > 120 ? 120 : (availableWidth - 2 * margin) / maxElementsPerLine;

    return {
        maxElementsPerLine: maxElementsPerLine,
        rows: Math.ceil(segments / maxElementsPerLine),
        segments: segments,
        segmentLength: segmentWidth,
        segmentHeight: segmentWidth * 1.5,
        margin: margin,
        pace: getSelectedPace(),
        fastestPace: getSelectedPace() - 60,
        slowestPace: getSelectedPace() + 90,
        distance: selectedDistance,
        scalingFactor: 1
    }
}

function onPaceChange() {
    setTime(getSelectedPace(), getDistance());
    renderPacePlanningWidget(getParams());
}

function onTimeChange() {
    setPace(getSelectedTime(), getDistance());
    renderPacePlanningWidget(getParams());
}

function setTime(pace, distance) {
    let time = pace * distance;

    let h = Math.floor(time / (60 * 60));
    timeHoursElement.value = h;

    let m = Math.floor((time - h * 60 * 60) / (60));
    timeMinutesElement.value = m;

    let s = (time % 60).toFixed(1);
    timeSecondsElement.value = s;
}

function setExactTime(time) {
    let h = Math.floor(time / (60 * 60));
    timeHoursElement.value = h;

    let m = Math.floor((time - h * 60 * 60) / (60));
    timeMinutesElement.value = m;

    let s = (time % 60).toFixed(1);
    timeSecondsElement.value = s;
}

function setPace(time, distance) {
    let pace = (time / distance);

    let m = Math.floor((pace) / (60));
    paceMinutesElement.value = m;

    let s = (pace % (60)).toFixed(1);
    paceSecondsElement.value = s;
}

function getSelectedPace() {
    
    let currentSelectedPaceMin = isNaN(parseFloat(paceMinutesElement.value)) ? DEFAULT_MIN_PACE : parseFloat(paceMinutesElement.value);
    let currentSelectedPaceSec = isNaN(parseFloat(paceSecondsElement.value)) ? DEFAULT_SEC_PACE : parseFloat(paceSecondsElement.value);

    return currentSelectedPaceMin * 60 + currentSelectedPaceSec;
}

function getSelectedTime() {
    let currentSelectedTimeHour = isNaN(parseFloat(timeHoursElement.value)) ? DEFAULT_HOUR_TIME : parseFloat(timeHoursElement.value);
    let currentSelectedTimeMin = isNaN(parseFloat(timeMinutesElement.value)) ? DEFAULT_MIN_TIME : parseFloat(timeMinutesElement.value);
    let currentSelectedTimeSec = isNaN(parseFloat(timeSecondsElement.value)) ? DEFAULT_SEC_TIME : parseFloat(timeSecondsElement.value);

    return currentSelectedTimeHour * 60 * 60 + currentSelectedTimeMin * 60 + currentSelectedTimeSec;
}

function getDistance() {
    let distanceElement = document.querySelector("#race-distance");

    return parseFloat(distanceElement.options[distanceElement.selectedIndex].value);
}

main();

function renderPacePlanningWidget(params) {
    createPacePlanningWidget(params);
}

function clearCanvas(paper) {
    if (paper.project) {
        paper.project.activeLayer.removeChildren();
    }   

    initState(getParams());
}

function createPacePlanningWidget(params) {

    let existingCanvas = document.querySelector("#myCanvas");

    if (existingCanvas) {
        existingCanvas.remove();
    }

    let canvas = document.createElement("canvas");
    canvas.id = "myCanvas";

    let canvasDiv = document.querySelector(".canvas");

    canvasDiv.appendChild(canvas);

    let paper = init(params);

    for (let i = 0; i < params.rows; i++) {
        drawMainRectangle(paper, params, i);
        drawPerSegmentRectangle(paper, params, i);
        drawPaceLabel(paper, params, i);
        drawDefaultPaceLine(paper, params, i);
    }

    display(paper);
}

function secondsToLabel(pace) {
    let m = Math.floor(pace / 60);
    let s = Math.round(pace % 60);

    let ss = `${s}`.padStart(2, '0');

    return `${m}:${ss}`;
}

function init(params) {
    clearCanvas(paper);

    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    canvas.setAttribute('width', params.segments * params.segmentLength +  2 * params.margin);
    canvas.setAttribute('height', (params.segmentHeight + 2 * params.margin) * params.rows);
    // Create an empty project and a view for the canvas:

    let scope  = new paper.PaperScope;
    scope.setup(canvas);
    scope.activate();

    scopes.push(scope);

    return scope;
}

function getSegmentsForRow(params, r) {
    let segmentsInRow = params.maxElementsPerLine;
    if (r === params.rows - 1 && params.rows * params.maxElementsPerLine != params.segments) {
        segmentsInRow = params.segments % params.maxElementsPerLine;
    }
    return segmentsInRow;
}

function drawMainRectangle(paper, params, r) {
    let segmentsInRow = getSegmentsForRow(params, r);

    let topLeft = new paper.Point(params.margin, params.margin + (params.margin * 2 + params.segmentHeight) * row);
    let rectSize = new paper.Size(params.segmentLength * segmentsInRow, params.segmentHeight);
    let rect = new paper.Rectangle(topLeft, rectSize);

    let path = new paper.Path.Rectangle(rect);
    path.fillColor = '#ffffff';
    path.strokeColor = '#000000';
    path.selected = false;
    path.strokeWidth = params.scalingFactor;
}

function drawPerSegmentRectangle(paper, params, r) {
    let segmentsInRow = getSegmentsForRow(params, r);

    for (let i = 0; i < segmentsInRow; i++) {
        let topLeft = new paper.Point(params.margin + i * params.segmentLength, params.margin + (params.margin * 2 + params.segmentHeight) * r);
        let rectSize = new paper.Size(params.segmentLength, params.segmentHeight);
        let rect = new paper.Rectangle(topLeft, rectSize);

        let path = new paper.Path.Rectangle(rect);

        path.onMouseLeave = function() {
            document.getElementById('myCanvas').style.setProperty('cursor', null);
        };

        path.fillColor = '#ffffff';
        path.strokeColor = '#000000';
        path.selected = false;
        path.strokeWidth = 1;

        path.row = r;
        path.column = i;

        path.onMouseLeave =  function(event) {
            for (let i = 0; i < boxes[row(path.row)].length; i++) {
                boxes[row(path.row)][i].fillColor = '#fff';
                allPaces[row(path.row)][i].fillColor = 'black';
                allKms[row(path.row)][i].fillColor = 'black';
                circles[row(path.row)][i].visible = false;
            }
        }

        path.onMouseEnter = function(event) {
            highlightBox(path);
        }

        path.onMouseDrag = function(event) {
            doTheThing(event, params, path);
        }

        path.onMouseDown = function(event) {
            doTheThing(event, params, path);
        }

        boxes[row(r)].push(path);
    }
}

function highlightBox(path) {
    let s = path.column;

    if (boxes[row(path.row)][s]) {
        boxes[row(path.row)][s].fillColor = '#f7f7fa';
    }

    if (allPaces[row(path.row)][s]) {
        allPaces[row(path.row)][s].fillColor = '#fc5200';
    }
    

    if (allKms[row(path.row)][s]) {
        allKms[row(path.row)][s].fillColor = '#fc5200';
    }

    if (circles[row(path.row)][s]) {
        circles[row(path.row)][s].visible = true;
    }
}

function drawPaceLabel(paper, params, r) {

    let segments = getSegmentsForRow(params, r);

    let text = new paper.PointText(new paper.Point((params.segmentLength * segments + params.margin * 2) / 2, params.margin - 15  + (params.margin * 2 + params.segmentHeight) * r));
    text.justification = 'center';
    text.fillColor = 'black';
    text.content = 'KM';
    text.fontWeight = 'bold';

    let pace = new paper.PointText(new paper.Point(30, params.margin - 15 + (params.margin * 2 + params.segmentHeight) * r));
    pace.justification = 'center';
    pace.fillColor = 'black';
    pace.content = 'PACE';
    pace.fontWeight = 'bold';

    let fastestPace = new paper.PointText(new paper.Point(0, params.margin + 5 + (params.margin * 2 + params.segmentHeight) * r));
    fastestPace.justification = 'left';
    fastestPace.fillColor = 'black';
    fastestPace.content = secondsToLabel(params.fastestPace);

    let slowestPace = new paper.PointText(new paper.Point(0, params.margin + params.segmentHeight + 5 + (params.margin * 2 + params.segmentHeight) * r));
    slowestPace.justification = 'left';
    slowestPace.fillColor = 'black';
    slowestPace.content = secondsToLabel(params.slowestPace);

    averagePace[row(r)] = new paper.PointText(new paper.Point(16 + params.margin + segments * params.segmentLength, getPaceLine(params, params.pace) + 5+ (params.margin * 2 + params.segmentHeight) * r));
    averagePace[row(r)].justification = 'center';
    averagePace[row(r)].fillColor = '#fc5200';
    averagePace[row(r)].content = secondsToLabel(params.pace);
    averagePace[row(r)].fontWeight = 'bold';

    let targetPace = new paper.PointText(new paper.Point(0, getPaceLine(params, params.pace)  + (params.margin * 2 + params.segmentHeight) * r));
    targetPace.justification = 'left';
    targetPace.fillColor = 'black';
    targetPace.content = secondsToLabel(params.pace);
    targetPace.fontWeight = 'bold';

    let targetPaceLine = new paper.Path();
    targetPaceLine.strokeColor = 'black';
    let start = new paper.Point(params.margin, getPaceLine(params, params.pace)+  (params.margin * 2 + params.segmentHeight) * r);
    targetPaceLine.moveTo(start);
    targetPaceLine.lineTo(start.add([params.segmentLength * segments, 0]));
    targetPaceLine.opacity = 0.4;

    // enableHighlightingAndDragging

    currentPaceLine[row(r)] = new paper.Path();
    currentPaceLine[row(r)].strokeColor = '#fc5200';
    let start2 = new paper.Point(params.margin, getPaceLine(params, params.pace)+ (params.margin * 2 + params.segmentHeight) * r);
    currentPaceLine[row(r)].moveTo(start2);
    currentPaceLine[row(r)].lineTo(start2.add([params.segmentLength * segments, 0]));
    currentPaceLine[row(r)].opacity = 0.4;
}

function getPaceLine(params, pace) {
    return params.margin + params.segmentHeight * (1 - (params.slowestPace - pace) / (params.slowestPace - params.fastestPace));
}

function doTheThing(event, params, box) {
    if (event.point.x < box.bounds.x || event.point.x > box.bounds.x + box.bounds.width) {
        return;
    }

    if (event.point.y < box.bounds.y || event.point.y > box.bounds.y + box.bounds.height) {
        return;
    }

    let r = box.row;
    let s = box.column;

    if (s > params.segments - 1 || s < 0) {
        return;
    }

    if (curves[row(r)][s] && curves[row(r)][s].p1) {
        curves[row(r)][s].p1.remove();
        curves[row(r)][s].p2.remove();
    } else {
        curves[row(r)][s] = {
            "p1": undefined,
            "p2": undefined,
        }
    }

    if (event.point.y < getPaceLine(params, params.pace) + (params.margin * 2 + params.segmentHeight) * r) {
        curves[row(r)][s].p1 = getNicerCurve1(
            new paper.Point(params.margin + params.segmentLength / 2 + params.segmentLength * s, event.point.y), 
            new paper.Point(params.margin + params.segmentLength + params.segmentLength * s, getPaceLine(params, params.pace)  + (params.margin * 2 + params.segmentHeight) * r));
        curves[row(r)][s].p2 = getNicerCurve2(
            new paper.Point(params.margin + params.segmentLength * s, getPaceLine(params, params.pace) +  (params.margin * 2 + params.segmentHeight) * r), 
            new paper.Point(params.margin + params.segmentLength / 2 + params.segmentLength * s, event.point.y));
    } else {
        curves[row(r)][s].p1 = getNicerCurve2(
            new paper.Point(params.margin + params.segmentLength / 2 + params.segmentLength * s, event.point.y), 
            new paper.Point(params.margin + params.segmentLength + params.segmentLength * s, getPaceLine(params, params.pace) +  (params.margin * 2 + params.segmentHeight) * r));
        curves[row(r)][s].p2 = getNicerCurve1(
            new paper.Point(params.margin + params.segmentLength * s, getPaceLine(params, params.pace) +  (params.margin * 2 + params.segmentHeight) * r), 
            new paper.Point(params.margin + params.segmentLength / 2 + params.segmentLength * s, event.point.y));
    }

    enableHighlightingAndDragging(curves[row(r)][s].p1, r, s, params)
    enableHighlightingAndDragging(curves[row(r)][s].p2, r, s, params)

    allPaces[row(r)][s].content = secondsToLabel(parseInt(params.fastestPace + (params.slowestPace - params.fastestPace) * ((event.point.y - box.bounds.y) / (params.segmentHeight))));

    let overallTotalTime = 0;

    for (let j = 0; j < params.rows; j++) {
        for(let i = 0; i < allPaces[row(j)].length; i++) {
            if (j === params.rows - 1 && i === allPaces[row(j)].length - 1 && params.distance % 1 > 0) {
                overallTotalTime += (paceFromLabel(allPaces[row(j)][i].content) * (params.distance % 1));
            } else {
                overallTotalTime += paceFromLabel(allPaces[row(j)][i].content);
            }
        }
    }

    let overallAveragePace = parseFloat(overallTotalTime / params.distance);

    for (let j = 0; j < params.rows; j++) {
        averagePace[row(j)].remove();
        currentPaceLine[row(j)].remove();
    }

    for (let j = 0; j < params.rows; j++) {
        let segments = getSegmentsForRow(params, j);

        averagePace[row(j)].remove();
        currentPaceLine[row(j)].remove();

        averagePace[row(j)] = new paper.PointText(new paper.Point(16 + params.margin + segments * params.segmentLength, getPaceLine(params, overallAveragePace) + 5+  (params.margin * 2 + params.segmentHeight) * j));
        averagePace[row(j)].justification = 'center';
        averagePace[row(j)].fillColor = '#fc5200';
        averagePace[row(j)].content = secondsToLabel(params.pace);
        averagePace[row(j)].fontWeight = 'bold';

        averagePace[row(j)].content = secondsToLabel(overallAveragePace);

        currentPaceLine[row(j)] = new paper.Path();
        currentPaceLine[row(j)].strokeColor = '#fc5200';
        let start2 = new paper.Point(params.margin, getPaceLine(params, overallAveragePace)+ (params.margin * 2 + params.segmentHeight) * j);
        currentPaceLine[row(j)].moveTo(start2);
        currentPaceLine[row(j)].lineTo(start2.add([params.segmentLength * segments, 0]));
        currentPaceLine[row(j)].opacity = 0.4;
    }
        
    let activeCircle = circles[row(r)][s];
    activeCircle.position = new paper.Point(activeCircle.position.x, event.point.y);
    
    setExactTime(overallTotalTime);
    setPace(getSelectedTime(), getDistance());
}

function drawDefaultPaceLine(paper, params, r) {
    let segments = getSegmentsForRow(params, r);

    for (let i = 0; i < segments; i++) {
        var myCircle = new paper.Path.Circle({
            radius: 4,
            center: new paper.Point(
                params.margin + params.segmentLength / 2 + params.segmentLength * i, 
                getPaceLine(params, params.pace) + (params.margin * 2 + params.segmentHeight) * r),
                onMouseDrag: function(event) {
                    let s = boxes[row(r)][i].column;
                    doTheThing(event, params, boxes[row(r)][s]);
                },
                onMouseEnter: function(event) {
                    document.getElementById('myCanvas').style.setProperty('cursor', 'pointer');

                    highlightBox(boxes[row(r)][i]);
                }
        });
        myCircle.fillColor = '#fc5200';
        myCircle.visible = false;
        circles[row(r)].push(myCircle);

        let text = new paper.PointText(new paper.Point(params.margin + params.segmentLength / 2 + params.segmentLength * i, params.margin - 5 + (params.margin * 2 + params.segmentHeight) * r));
        text.justification = 'center';
        text.fillColor = 'black';

        if (r === params.rows - 1 && i === segments - 1) {
            text.content = `${params.distance}`;
        } else {
            text.content = `${r * params.maxElementsPerLine + i + 1}`;
        }
        
        allKms[row(r)].push(text);
        

        let pace = new paper.PointText(new paper.Point(params.margin + params.segmentLength / 2 + params.segmentLength * i, params.margin + params.segmentHeight + 15 + (params.margin * 2 + params.segmentHeight) * r));
        pace.justification = 'center';
        pace.fillColor = 'black';
        pace.content = secondsToLabel(params.pace);
        allPaces[row(r)].push(pace);

        curveSet = false;
    }
}

function enableHighlightingAndDragging(element, r, c, params) {
    element.onMouseDrag = function(event) {
        doTheThing(event, params, boxes[row(r)][c]);
    };
    element.onMouseEnter = function(event) {
        highlightBox(boxes[row(r)][c]);
    }
}


function getActiveSegment(position, params) {
    return Math.floor((position.x - params.margin) / params.segmentLength);
}

function getNicerCurve1(a, b) {
    var rc =  new paper.Rectangle(a, b);

    var h1 = new paper.Point(rc.topCenter.x - a.x, rc.topCenter.y - a.y);
    var h2 = new paper.Point(rc.bottomCenter.x - b.x, rc.bottomCenter.y - b.y);

    var r1seg = new paper.Segment(
        a,
        null,
        h1
        );

    var r2seg = new paper.Segment(
        b, 
        h2,
        null, 
        );

    let path3 = new paper.Path(r1seg, r2seg);
    path3.strokeColor = '#fc5200';

    return path3;
}

function getNicerCurve2(a, b) {
    var rc =  new paper.Rectangle(a, b);
    var h1 = new paper.Point(rc.topCenter.x - b.x, rc.topCenter.y - b.y);
    var h2 = new paper.Point(rc.bottomCenter.x - a.x, rc.bottomCenter.y - a.y);

    var r1seg = new paper.Segment(
        a,
        null,
        h2
        );

    var r2seg = new paper.Segment(
        b, 
        h1,
        null, 
        );

    let path3 = new paper.Path(r1seg, r2seg);
    path3.strokeColor = '#fc5200';

    return path3;
}

function display(paper) {
    paper.view.draw();
}

function paceFromLabel(pace) {
    let components = pace.split(':');

    result = parseInt(components[0]) * 60 + parseInt(components[1]);
    return result;
}