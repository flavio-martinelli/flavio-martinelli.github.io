var sqrt3 = Math.sqrt(3);

var IOboxX = 25;  // absolute x-coordinate of the IObox
var IOboxY = 285; // absolute y-coordinate of the IObox
var IOboxWidth = 330;
var IOboxHeight = 330;

var rightColumnShift = 13; // extra space between the input-output space and the right column

var AWboxX = 2.5*IOboxX + IOboxWidth + rightColumnShift;  // absolute x-coordinate of the a-w box
var AWboxY = 200; // absolute y-coordinate of the a-w box
var AWboxWidth = 140;
var AWboxHeight = 140;
var AWlimX = 1.5;
var AWlimY = 1.5;

var WBboxX = 2.5*IOboxX + IOboxWidth + rightColumnShift + 150;  // absolute x-coordinate of the WBbox
var WBboxY = AWboxY; // absolute y-coordinate of the WBbox
var WBboxWidth = 140;
var WBboxHeight = 140;
var WBlimX = 1.5;
var WBlimY = 1.5;

var LossboxX = 2.5*IOboxX + IOboxWidth + rightColumnShift + 25;  // absolute x-coordinate of the loss box (aligned with the K-M box)
var LossboxY = 83; // absolute y-coordinate of the loss box
var LossboxWidth = 250; // same width as the K-M box
var LossboxHeight = 75;
var lossTraces = []; // one array of loss values per learning run, the last one is the current run
var lossRunActive = false; // false after a student reset: the next learning step starts a new trace

var KMboxX = 2.5*IOboxX + IOboxWidth + rightColumnShift + 25;  // absolute x-coordinate of the kink-slope box
var KMboxY = AWboxY + 185; // absolute y-coordinate of the kink-slope box
var KMboxWidth = 250;
var KMboxHeight = 100;
var KMgap = 30; // vertical gap between the s=+1 and s=-1 K-M boxes
var KMlimX = sqrt3;
var KMlimY = 2.5;

// initialize trajectory arrays
var trajectoryKM = [];
var trajectoryAW = [];
var trajectoryWB = [];
var trajectorySkipIdxs = [];
var trajectoryLag = 5;
var trajectoryLagCount = 0;
var learnActivated = false;

// initialize colors
var titleTextColor = 255;
var backgroundBoxColor = 255;

// set colors based on the theme
function defineColorsOnTheme() {
    var theme = document.documentElement.getAttribute('data-theme'); // Get the current theme from the body attribute

    if (theme === 'dark') {
        backgroundColor = color(30);
        titleTextColor = color(255);
        backgroundBoxColor = color(90);
    } else {
        backgroundColor = color(255);
        titleTextColor = color(0);
        backgroundBoxColor = color(240);
    }
}


function drawBoxes(){
    hoverItems = [];
    drawIOAxes();
    drawKMAxes();
    drawAWAxes();
    drawWBAxes();
    updateOutcomeMaps();
    drawOutcomeMaps();
    drawReentryShading();
    logLoss();
    drawLossPlot();
    logTrajectory();
    drawKMTrajectory();
    drawAWTrajectory();
    drawWBTrajectory();
    drawKMPoint();
    drawAWPoint();
    drawWBPoint();
}

function drawArrow(x1, y1, x2, y2, arrowSize) {
    // Draw the arrow shaft
    line(x1, y1, x2, y2);
    // Calculate the angle of the arrow
    var angle = atan2(y2 - y1, x2 - x1);
    // Draw the arrowhead
    push();
    translate(x2, y2);
    rotate(angle);
    var arrowHeadX = -arrowSize;
    var arrowHeadY = arrowSize / 2;
    triangle(0, 0, arrowHeadX, arrowHeadY, arrowHeadX, -arrowHeadY);
    pop(); 
}

function drawIOAxes(){
    // draw the x and y axes in the box coordinates
    push(); 
    stroke(180); strokeWeight(0);
    // draw the box by computing the top-left and bottom-right coordinates
    [x1, y1] = convertToIOBoxCoordinates(-sqrt3, sqrt3);
    [x2, y2] = convertToIOBoxCoordinates(sqrt3, -sqrt3);
    fill(backgroundBoxColor);
    rect(x1, y1, x2-x1, y2-y1);
    // draw x-axis in box coordinates
    [x, y] = convertToIOBoxCoordinates(-sqrt3, 0);
    stroke(200); strokeWeight(2);
    drawArrow(x, y, x + IOboxWidth, y, 10);
    // draw y-axis in box coordinates
    [x, y] = convertToIOBoxCoordinates(0, sqrt3);
    drawArrow(x, y + IOboxHeight, x, y, 10);
    pop();
}

function drawKMAxes(){
    // draw the x and y axes in the box coordinates 
    // s = +1
    push(); 
    strokeWeight(0); fill(backgroundBoxColor);
    // draw the box by computing the top-left and bottom-right coordinates
    [x1, y1] = convertToKMBoxCoordinates(-KMlimX, KMlimY);
    [x2, y2] = convertToKMBoxCoordinates(KMlimX, -KMlimY);
    rect(x1, y1, x2-x1, y2-y1);
    // draw x-axis in box coordinates
    [x, y] = convertToKMBoxCoordinates(-KMlimX, 0);
    stroke(200); strokeWeight(2);
    drawArrow(x, y, x + KMboxWidth, y, 10);
    // draw y-axis in box coordinates
    [x, y] = convertToKMBoxCoordinates(0, KMlimY);
    drawArrow(x, y + KMboxHeight, x, y, 10);
    pop();
    // s = -1
    push(); 
    strokeWeight(0); fill(backgroundBoxColor);
    [x1, y1] = convertToKMBoxCoordinates(-KMlimX, KMlimY, s=-1);
    [x2, y2] = convertToKMBoxCoordinates(KMlimX, -KMlimY, s=-1);
    rect(x1, y1, x2-x1, y2-y1);
    [x, y] = convertToKMBoxCoordinates(-KMlimX, 0, s=-1);
    stroke(200); strokeWeight(2);
    drawArrow(x, y, x + KMboxWidth, y, 10);
    [x, y] = convertToKMBoxCoordinates(0, KMlimY, s=-1);
    drawArrow(x, y + KMboxHeight, x, y, 10);
    pop();
}

function drawAWAxes(){
    // draw the x and y axes in the box coordinates
    push(); 
    stroke(180); strokeWeight(0);
    // draw the box by computing the top-left and bottom-right coordinates
    [x1, y1] = convertToAWBoxCoordinates(-AWlimX, AWlimY);
    [x2, y2] = convertToAWBoxCoordinates(AWlimX, -AWlimY);
    fill(backgroundBoxColor);
    rect(x1, y1, x2-x1, y2-y1);
    // draw x-axis in box coordinates
    [x, y] = convertToAWBoxCoordinates(-AWlimX, 0);
    stroke(200); strokeWeight(2);
    drawArrow(x, y, x + AWboxWidth, y, 10);
    // draw y-axis in box coordinates
    [x, y] = convertToAWBoxCoordinates(0, AWlimY);
    drawArrow(x, y + AWboxHeight, x, y, 10);
    pop();
}

function drawWBAxes(){
    // draw the x and y axes in the box coordinates
    push(); 
    stroke(180); strokeWeight(0);
    // draw the box by computing the top-left and bottom-right coordinates
    [x1, y1] = convertToWBBoxCoordinates(-WBlimX, WBlimY);
    [x2, y2] = convertToWBBoxCoordinates(WBlimX, -WBlimY);
    fill(backgroundBoxColor);
    rect(x1, y1, x2-x1, y2-y1);
    // draw x-axis in box coordinates
    [x, y] = convertToWBBoxCoordinates(-WBlimX, 0);
    stroke(200); strokeWeight(2);
    drawArrow(x, y, x + WBboxWidth, y, 10);
    // draw y-axis in box coordinates
    [x, y] = convertToWBBoxCoordinates(0, WBlimY);
    drawArrow(x, y + WBboxHeight, x, y, 10);

    beginClip();
    rect(WBboxX, WBboxY, WBboxWidth, WBboxHeight); 
    endClip();
    res = 0.1;
    for (let i = -WBlimX; i < WBlimX; i += res) {
        // line for kink out-of-bounds
        [x1, y1] = convertToWBBoxCoordinates(i, -sqrt3 * i);
        [x2, y2] = convertToWBBoxCoordinates(i+res, -sqrt3 * (i+res));
        strokeWeight(2); stroke(230);
        line(x1, y1, x2, y2);
        [x1, y1] = convertToWBBoxCoordinates(i, sqrt3 * i);
        [x2, y2] = convertToWBBoxCoordinates(i+res, sqrt3 * (i+res));
        line(x1, y1, x2, y2);
    }
    // lower halves: edges of the dead cone (the upper halves get their tooltip in drawReentryShading)
    for (let wSign of [1, -1]) {
        var [ox, oy] = convertToWBBoxCoordinates(0, 0);
        var [ex, ey] = convertToWBBoxCoordinates(wSign * WBlimX, -sqrt3 * WBlimX);
        hoverItems.push({x1: ox, y1: oy, x2: ex, y2: ey, priority: 1, text: '\\(b = -\\sqrt{3}\\,|w|\\)'});
    }

    pop();
}

function drawText(){
    // draw all necessary text
    push();
    textSize(15);
    fill(titleTextColor); stroke(titleTextColor); strokeWeight(0.5);
    textAlign(CENTER, CENTER);
    text("INPUT-OUTPUT SPACE", IOboxX + IOboxWidth / 2, IOboxY - 15);
    text("K-M SPACE ⋅ S = +1", KMboxX + KMboxWidth / 2, KMboxY - 15);
    text("K-M SPACE ⋅ S = -1", KMboxX + KMboxWidth / 2, KMboxY + KMboxHeight + KMgap - 15);
    text("W-A SPACE", AWboxX + AWboxWidth / 2, AWboxY - 15);
    text("W-B SPACE", WBboxX + WBboxWidth / 2, WBboxY - 15);
    // "LOSS" with a "log10" subscript, centred as a whole
    var wMain = textWidth("LOSS");
    textSize(10); var wSub = textWidth("log10"); textSize(15);
    var xL = LossboxX + LossboxWidth / 2 - (wMain + wSub) / 2;
    textAlign(LEFT, CENTER);
    text("LOSS", xL, LossboxY - 15);
    textSize(10); text("log10", xL + wMain + 1, LossboxY - 10);
    textSize(15); textAlign(CENTER, CENTER);
    pop();
}

function drawRelu(k,s,m,c,col,b=NaN){
    push();
    // clip the drawing to the box
    beginClip();
    rect(IOboxX, IOboxY, IOboxWidth, IOboxHeight);
    endClip();
    // draw the ReLU function with kink k, sign s, slope m, and constant c
    strokeWeight(2);
    stroke(col);
    
    if (isNaN(k)){  // if k is NaN, the ReLU is flat. Otherwise continue
        // the contribution is only given by the bias (if positive) and the final c 
        [x1, y1] = convertToIOBoxCoordinates(-sqrt3, c+aS*nj.max([0, b]));
        [x2, y2] = convertToIOBoxCoordinates( sqrt3, c+aS*nj.max([0, b]));
        line(x1, y1, x2, y2);
        return;
    }
    if (s >= 0) {  // the ReLU is pointing right
        // flat part
        [x1, y1] = convertToIOBoxCoordinates(-sqrt3, c);
        [x2, y2] = convertToIOBoxCoordinates(k, c);
        line(x1, y1, x2, y2);
        // compute x,y of rightmost point of the relu (@ sqrt3)
        [x3, y3] = convertToIOBoxCoordinates(sqrt3, c+m*relu(sqrt3-k));
        line(x2, y2, x3, y3);
    }
    else{  // the ReLU is pointing left
        // slope part
        [x1, y1] = convertToIOBoxCoordinates(-sqrt3, c+m*relu(-(-sqrt3-k)));
        [x2, y2] = convertToIOBoxCoordinates(k, c);
        line(x1, y1, x2, y2);
        // flat part
        [x3, y3] = convertToIOBoxCoordinates(sqrt3, c);
        line(x2, y2, x3, y3);
    }
    pop();
}

function enlargeKinkTeacher() {
    [x, y] = convertToIOBoxCoordinates(kt, ct);
    if (checkMouseInRadius(x, y, 10)) {
        fill(255, 0, 0, 50);
        stroke(255, 0, 0, 0);
        ellipse(x, y, 20);
    }
}

function enlargeKinkStudent() {
    [x, y] = convertToIOBoxCoordinates(ks, cs);
    if (checkMouseInRadius(x, y, 10)) {
        fill(0, 0, 255, 50);
        stroke(0, 0, 255, 0);
        ellipse(x, y, 20);
    }
}

function enlargeAWPoint() {
    var [x, y] = convertToAWBoxCoordinates(ws, aS);
    if (checkMouseInRadius(x, y, 10)) {
        fill(0, 128, 255, 50); 
        stroke(0, 128, 255, 0);
        ellipse(x, y, 25);
    }
}

function enlargeWBPoint() {
    var [x, y] = convertToWBBoxCoordinates(ws, bs);
    if (checkMouseInRadius(x, y, 10)) {
        fill(0, 128, 255, 50); 
        stroke(0, 200, 100, 0);
        ellipse(x, y, 25);
    }
}

function enlargeKMPoint() {
    var [x, y] = convertToKMBoxCoordinates(ks, ms, s=ss);
    if (checkMouseInRadius(x, y, 10)) {
        fill(0, 128, 255, 50); 
        stroke(255, 180, 0, 0);
        ellipse(x, y, 25);
    }
    [x, y] = convertToKMBoxCoordinates(kt, mt, s=st);
    if (checkMouseInRadius(x, y, 10)) {
        fill(255, 0, 0, 50); 
        stroke(255, 180, 0, 0);
        ellipse(x, y, 25);
    }
}

function enlargeSlopeStudent() {
    // compute angle
    if (ss > 0){
        angle = -Math.atan(ms)}
    else{
        angle = Math.atan(ms)+Math.PI}
    // center frame of reference on kink and rotate by angle
    push();
    [x, y] = convertToIOBoxCoordinates(ks, cs);
    translate(x,y);
    rotate(angle);
    // translate and rotate mouse coordinates
    [mx, my] = [mouseX, mouseY];
    [mx, my] = [mx-x, my-y];
    [mx, my] = [mx*Math.cos(angle) + my*Math.sin(angle), -mx*Math.sin(angle) + my*Math.cos(angle)];
    // highlight box centered on the x axis at y = 50 and over
    if ((mx > 30 && mx < 30 + 120 && my > -7.5 && my < -7.5 + 15)){
        fill(0, 0, 255, 50);
        stroke(0, 0, 255, 0);
        rect(30, -7.5, 120, 15);
    }
    pop()
}

function enlargeSlopeTeacher() {
    // compute angle
    if (st > 0){
        angle = -Math.atan(mt)}
    else{
        angle = Math.atan(mt)+Math.PI}
    // center frame of reference on kink and rotate by angle
    push();
    [x, y] = convertToIOBoxCoordinates(kt, ct);
    translate(x,y);
    rotate(angle);
    // translate and rotate mouse coordinates
    [mx, my] = [mouseX, mouseY];
    [mx, my] = [mx-x, my-y];
    [mx, my] = [mx*Math.cos(angle) + my*Math.sin(angle), -mx*Math.sin(angle) + my*Math.cos(angle)];
    // highlight box centered on the x axis at y = 50 and over
    if ((mx > 30 && mx < 30 + 120 && my > -7.5 && my < -7.5 + 15)){
        fill(255, 0, 0, 50);
        stroke(255, 0, 0, 0);
        rect(30, -7.5, 120, 15);
    }
    pop()
}

function drawKMPoint(){
    // draw the point in the KM space
    [xs, ys] = convertToKMBoxCoordinates(ks, ms, s=ss);
    [xt, yt] = convertToKMBoxCoordinates(kt, mt, s=st);
    push();
    stroke(2); strokeWeight(2); fill(teacherLabelColor);
    if ((abs(kt) < sqrt3+0.1) & (abs(mt) < KMlimY+0.1)) {ellipse(xt, yt, 10);}
    stroke(2); strokeWeight(2); fill(studentLabelColor);
    if ((abs(ks) < sqrt3+0.1) & (abs(ms) < KMlimY+0.1)) {ellipse(xs, ys, 10);}
    pop();
}

function drawAWPoint(){
    // draw the point in the AW space
    [xs, ys] = convertToAWBoxCoordinates(ws, aS);
    startW = abs(mt)/AWlimY;
    endW = AWlimX;
    // plot the line from startW to endW for the x coordinate and a=mt/w for the y coordinate
    push();
    beginClip();
    rect(AWboxX, AWboxY, AWboxWidth, AWboxHeight);
    endClip();
    res = 0.05;
    for (let i = startW; i < endW - res; i += res) {
        [x1, y1] = convertToAWBoxCoordinates(st*i, mt/i);
        [x2, y2] = convertToAWBoxCoordinates(st*(i+res), mt/(i+res));
        strokeWeight(2); stroke(teacherLabelColor);
        line(x1, y1, x2, y2);
        hoverItems.push({x1, y1, x2, y2, priority: 0, text: '\\(a = m^{*} / |w|\\)'});
    }
    pop();
    push();
    stroke(2); strokeWeight(2); fill(studentLabelColor);
    if ((abs(ws) < AWlimX+0.1) & (abs(aS) < AWlimY+0.1)) {ellipse(xs, ys, 10);}
    pop();
}

function drawWBPoint(){
    // draw the point in the WB space
    [xw, yb] = convertToWBBoxCoordinates(ws, bs);
    startW = 0;
    endW = WBlimX * st;
    push();
    beginClip();
    rect(WBboxX, WBboxY, WBboxWidth, WBboxHeight); 
    endClip();
    // plot the line from startW to endW for the x coordinate and b=mt/w for the y coordinate
    res = 0.05;
    for (let i = startW; i < abs(endW); i += res) {
        // teacher equivalent line
        [x1, y1] = convertToWBBoxCoordinates(st*i, -kt * i * st);
        [x2, y2] = convertToWBBoxCoordinates(st*(i+res), -kt * (i+res) * st);
        strokeWeight(2); stroke(teacherLabelColor);
        line(x1, y1, x2, y2);
    }
    stroke(2); strokeWeight(2); fill(studentLabelColor);
    if ((abs(ws) < WBlimX+0.1) & (abs(bs) < WBlimY+0.1)) {ellipse(xw, yb, 10);}
    pop();
    var [tx1, ty1] = convertToWBBoxCoordinates(0, 0);
    var [tx2, ty2] = convertToWBBoxCoordinates(st * WBlimX, -kt * WBlimX);
    hoverItems.push({x1: tx1, y1: ty1, x2: tx2, y2: ty2, priority: 0, text: '\\(b = -k^{*} \\cdot w\\)'});
}

function drawHoverTooltip() {
    // explanation of the W-A / W-B element under the mouse (closest within a few pixels, most specific first)
    var inBox = (x, y, w, h) => mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
    if (mouseIsPressed || !(inBox(WBboxX, WBboxY, WBboxWidth, WBboxHeight) || inBox(AWboxX, AWboxY, AWboxWidth, AWboxHeight))) return;
    var best = null, bestScore = Infinity;
    for (const it of hoverItems) {
        var d;
        if (it.x !== undefined) {
            d = dist(mouseX, mouseY, it.x, it.y) - 2;
        } else {
            // distance to the segment from (x1, y1) to (x2, y2)
            var dx = it.x2 - it.x1, dy = it.y2 - it.y1;
            var t = constrain(((mouseX - it.x1) * dx + (mouseY - it.y1) * dy) / (dx * dx + dy * dy), 0, 1);
            d = dist(mouseX, mouseY, it.x1 + t * dx, it.y1 + t * dy);
        }
        if (d > 5) continue;
        var score = d - 3 * it.priority; // prefer points over lines when both are close
        if (score < bestScore) { bestScore = score; best = it; }
    }
    for (const key in tooltipDivs) tooltipDivs[key].hide();
    if (!best) return;

    // one MathJax-rendered div per formula, typeset once and reused
    if (!tooltipDivs[best.text]) {
        // same style as the button tooltips (addTooltip)
        tooltipDivs[best.text] = createDiv(best.text)
            .parent('canvas-container')
            .style('position', 'absolute')
            .style('background-color', 'rgba(255, 255, 255, 0.8)')
            .style('border', '1px solid #ccc')
            .style('padding', '5px')
            .style('border-radius', '5px')
            .style('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.1)')
            .style('font-size', '11px')
            .style('color', '#000')
            .style('white-space', 'nowrap')
            .style('pointer-events', 'none')
            .style('z-index', '10');
        MathJax.typesetPromise([tooltipDivs[best.text].elt]);
    }
    var tip = tooltipDivs[best.text];
    tip.show();
    // same placement as the button tooltips (right of and above the cursor), kept inside the canvas
    var tx = constrain(mouseX + 10, 5, width - tip.elt.offsetWidth - 5);
    var ty = constrain(mouseY - 30, 5, height - tip.elt.offsetHeight - 5);
    tip.position(tx, ty);
}

var tooltipDivs = {};


function logTrajectory(){
    // logs trajectory if training is on
    if (toggleLearn){
        learnActivated = true;
        if (trajectoryLagCount % trajectoryLag == 0){
            // push the current point to the trajectory arrays
            trajectoryKM.push([ks, ms, ss]);
            trajectoryAW.push([ws, aS]);
            trajectoryWB.push([ws, bs]);
            trajectoryLagCount = 0;
        }
        trajectoryLagCount++;
    }
    if (!toggleLearn & learnActivated){
        learnActivated = false;
        trajectorySkipIdxs.push(trajectoryKM.length);
    }
}

function drawKMTrajectory(){
    // draw the trajectory in the KM space
    push();
    // clip the drawing to the box
    beginClip();
    rect(KMboxX, KMboxY, KMboxWidth, KMboxHeight);
    rect(KMboxX, KMboxY + KMboxHeight + KMgap, KMboxWidth, KMboxHeight);
    endClip();

    stroke(studentLabelColor); strokeWeight(2);
    for (let i = 0; i < trajectoryKM.length - 1; i++) {
        var [x1, y1] = convertToKMBoxCoordinates(trajectoryKM[i][0], trajectoryKM[i][1], s=trajectoryKM[i][2]);
        var [x2, y2] = convertToKMBoxCoordinates(trajectoryKM[i + 1][0], trajectoryKM[i + 1][1], s=trajectoryKM[i][2]);
        if (!trajectorySkipIdxs.includes(i+1)){ 
            // check for overflow in y coordinates in between the two plots! (clip can't account for it)
            if ((trajectoryKM[i][2]>0 & y1 < KMboxY + KMboxHeight) | (trajectoryKM[i][2]<0 & y1 > KMboxY + KMboxHeight + KMgap)){
                line(x1, y1, x2, y2); 
            }
        }
    }
    pop();
}


function drawAWTrajectory(){
    // draw the trajectory in the AW space
    push();
    // clip the drawing to the box
    beginClip();
    rect(AWboxX, AWboxY, AWboxWidth, AWboxHeight);
    endClip();
    stroke(studentLabelColor); strokeWeight(2);
    for (let i = 0; i < trajectoryAW.length - 1; i++) {
        var [x1, y1] = convertToAWBoxCoordinates(trajectoryAW[i][0], trajectoryAW[i][1]);
        var [x2, y2] = convertToAWBoxCoordinates(trajectoryAW[i + 1][0], trajectoryAW[i + 1][1]);
        if (!trajectorySkipIdxs.includes(i+1)){ 
            line(x1, y1, x2, y2); 
        }
    }
    pop();
}

function drawWBTrajectory(){
    // draw the trajectory in the WB space
    push();
    // clip the drawing to the box
    beginClip();
    rect(WBboxX, WBboxY, WBboxWidth, WBboxHeight); 
    endClip();
    stroke(studentLabelColor); strokeWeight(2);
    for (let i = 0; i < trajectoryWB.length - 1; i++) {
        var [x1, y1] = convertToWBBoxCoordinates(trajectoryWB[i][0], trajectoryWB[i][1]);
        var [x2, y2] = convertToWBBoxCoordinates(trajectoryWB[i + 1][0], trajectoryWB[i + 1][1]);
        if (!trajectorySkipIdxs.includes(i+1)){ 
            line(x1, y1, x2, y2); 
        }
    }
    pop();
}

var hoverItems = []; // elements of the W-A and W-B boxes that show an explanation on hover, rebuilt every frame

function drawReentryShading() {
    var errors = computeError(data, kt, st, mt, ct, ws, bs, aS, cs);
    var Ed  = nj.mean(errors);
    var Edx = nj.mean(errors.multiply(data));
    var R = sqrt3;

    push();
    beginClip(); rect(WBboxX, WBboxY, WBboxWidth, WBboxHeight); endClip();
    strokeWeight(3);

    for (let wSign of [1, -1]) {
        // Cone-edge tinting at k = -R:
        //   k̇|_{k=-R} ∝ a · (E[δ] - R · sign(w) · E[δx])
        var kdotEdge = aS * (Ed - R * wSign * Edx);
        if (kdotEdge > 0) stroke(0, 180, 80, 25);    // GREEN: permeable (re-entry)
        else              stroke(220, 60, 60, 25);   // RED:   trapping
        var [x1, y1] = convertToWBBoxCoordinates(0, 0);
        var [x2, y2] = convertToWBBoxCoordinates(wSign * WBlimX, R * WBlimX);
        line(x1, y1, x2, y2);
        hoverItems.push({x1, y1, x2, y2, priority: 1, text: '\\(b = \\sqrt{3}\\,|w|\\)'});
    }

    // best linear approximation target, to be shown only inside the cone defined by k = -R:
    if (Math.abs(aS) > 1e-6){
        var Ex2 = nj.mean(data.multiply(data));  // E[x²]
        var wTarget = ws - Edx / (aS * Ex2);
        var bTarget = bs - Ed / aS;
        var kTarget = -bTarget / wTarget;
        if (Math.abs(wTarget) < WBlimX && Math.abs(bTarget) < WBlimY) {
            var [xt, yt] = convertToWBBoxCoordinates(wTarget, bTarget);
            push();
            if ((kTarget < -R) || (kTarget > R)) stroke(160, 60, 200);
            else stroke(160, 60, 200, 15);   // PURPLE: instantaneous saddle target
            strokeWeight(2); noFill();
            ellipse(xt, yt, 10);
            line(xt - 5, yt, xt + 5, yt);
            line(xt, yt - 5, xt, yt + 5);
            pop();
            hoverItems.push({x: xt, y: yt, priority: 3, text: 'Best linear fit with \\(a\\) and \\(c\\) fixed'});
        }
    }


    pop();
}


// Loss plot

function computeLoss(){
    // L = 1/2 * mean(errors^2) over the dataset
    var n = data.shape[0];
    var L = 0;
    for (let i = 0; i < n; i++){
        var x = data.get(i);
        var e = aS*Math.max(0, ws*x + bs) + cs - (mt*Math.max(0, st*(x - kt)) + ct);
        L += e*e;
    }
    return Math.max(0.5*L/n, 1e-16); // avoid log(0)
}

function logLoss(){
    // pausing and resuming continues the current trace, only a student reset starts a new one
    if (toggleLearn){
        if (!lossRunActive){
            lossTraces.push([]);
            lossRunActive = true;
        }
        lossTraces[lossTraces.length - 1].push(computeLoss());
    }
}

function drawLossPlot(){
    var pad = 6;
    var x0 = LossboxX + pad, x1 = LossboxX + LossboxWidth - pad;
    var y0 = LossboxY + LossboxHeight - pad, y1 = LossboxY + pad;

    // dynamic axes: x spans the longest run, y (log10) fits all losses of all traces
    var nMax = 10, lo = Infinity, hi = -Infinity;
    for (const tr of lossTraces){
        nMax = Math.max(nMax, tr.length - 1);
        for (const v of tr){
            var l = Math.log10(v);
            if (l < lo) lo = l;
            if (l > hi) hi = l;
        }
    }
    // the current loss is always in range, so its marker stays visible
    var Lnow = Math.max(computeLoss(), 1e-12);
    lo = Math.min(lo, Math.log10(Lnow));
    hi = Math.max(hi, Math.log10(Lnow));
    if (hi - lo < 1e-9){ lo -= 1; hi += 1; }
    var span = Math.max(hi - lo, 0.5); // avoid zooming into tiny ranges
    var yLo = (lo + hi) / 2 - 0.55 * span, yHi = (lo + hi) / 2 + 0.55 * span;

    var toX = (i) => map(i, 0, nMax, x0, x1);
    var toY = (v) => map(Math.log10(v), yLo, yHi, y0, y1);

    push();
    noStroke(); fill(backgroundBoxColor);
    rect(LossboxX, LossboxY, LossboxWidth, LossboxHeight);

    // traces: past runs in grey, current run in the student color
    beginClip(); rect(LossboxX, LossboxY, LossboxWidth, LossboxHeight); endClip();
    noFill();
    for (let t = 0; t < lossTraces.length; t++){
        var tr = lossTraces[t];
        var current = (t === lossTraces.length - 1);
        stroke(current ? studentLabelColor : color(160, 160, 160, 170));
        strokeWeight(current ? 2 : 1.5);
        var stride = Math.max(1, Math.floor(tr.length / LossboxWidth)); // at most ~1 vertex per pixel
        beginShape();
        for (let i = 0; i < tr.length; i += stride) vertex(toX(i), toY(tr[i]));
        vertex(toX(tr.length - 1), toY(tr[tr.length - 1]));
        endShape();
    }

    // current loss value
    noStroke(); fill(titleTextColor); textSize(9); textAlign(RIGHT, TOP);
    text("L = " + Lnow.toExponential(2), LossboxX + LossboxWidth - 5, LossboxY + 4);
    pop();

    // marker at the current loss, at the end of the current run (or at the start after a student reset)
    var nNow = lossRunActive ? lossTraces[lossTraces.length - 1].length - 1 : 0;
    push();
    stroke(2); strokeWeight(2); fill(studentLabelColor);
    ellipse(toX(Math.max(nNow, 0)), toY(Lnow), 10);
    pop();
}
