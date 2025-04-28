var sqrt3 = Math.sqrt(3);

var IOboxX = 25;  // absolute x-coordinate of the IObox
var IOboxY = 265; // absolute y-coordinate of the IObox
var IOboxWidth = 330;
var IOboxHeight = 330;

var AWboxX = 2.5*IOboxX + IOboxWidth;  // absolute x-coordinate of the a-w box
var AWboxY = 100; // absolute y-coordinate of the a-w box
var AWboxWidth = 140;
var AWboxHeight = 140;
var AWlimX = 1.5;
var AWlimY = 1.5;

var WBboxX = 2.5*IOboxX + IOboxWidth + 150;  // absolute x-coordinate of the WBbox
var WBboxY = AWboxY; // absolute y-coordinate of the WBbox
var WBboxWidth = 140;
var WBboxHeight = 140;
var WBlimX = 1.5;
var WBlimY = 1.5;

var KMboxX = 2.5*IOboxX + IOboxWidth + 25;  // absolute x-coordinate of the kink-slope box
var KMboxY = AWboxY + 200; // absolute y-coordinate of the kink-slope box
var KMboxWidth = 250;
var KMboxHeight = 125;
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

function drawBoxes(){
    drawIOAxes();
    drawKMAxes();
    drawAWAxes();
    drawWBAxes();
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
    fill(240);
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
    strokeWeight(0); fill(240);
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
    strokeWeight(0); fill(240);
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
    fill(240);
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
    fill(240);
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

    pop();
}

function drawText(){
    // draw all necessary text
    push();
    textSize(15);
    fill(0); stroke(0); strokeWeight(0.5);
    textAlign(CENTER, CENTER);
    text("INPUT-OUTPUT SPACE", IOboxX + IOboxWidth / 2, IOboxY - 15);
    text("K-M SPACE ⋅ S = +1", KMboxX + KMboxWidth / 2, KMboxY - 15);
    text("K-M SPACE ⋅ S = -1", KMboxX + KMboxWidth / 2, KMboxY + KMboxHeight + 50 - 30);
    text("W-A SPACE", AWboxX + AWboxWidth / 2, AWboxY - 15);
    text("W-B SPACE", WBboxX + WBboxWidth / 2, WBboxY - 15);
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
}

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
    rect(KMboxX, KMboxY + KMboxHeight + 50, KMboxWidth, KMboxHeight);
    endClip();

    stroke(studentLabelColor); strokeWeight(2);
    for (let i = 0; i < trajectoryKM.length - 1; i++) {
        var [x1, y1] = convertToKMBoxCoordinates(trajectoryKM[i][0], trajectoryKM[i][1], s=trajectoryKM[i][2]);
        var [x2, y2] = convertToKMBoxCoordinates(trajectoryKM[i + 1][0], trajectoryKM[i + 1][1], s=trajectoryKM[i][2]);
        if (!trajectorySkipIdxs.includes(i+1)){ 
            // check for overflow in y coordinates in between the two plots! (clip can't account for it)
            if ((trajectoryKM[i][2]>0 & y1 < KMboxY + KMboxHeight) | (trajectoryKM[i][2]<0 & y1 > KMboxY + KMboxHeight + 50)){
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

