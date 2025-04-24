function convertToIOBoxCoordinates(x, y, limX = sqrt3, limY = sqrt3) {
    // Convert the x and y coordinates to the box coordinates
    var IOboxX2 = IOboxX + IOboxWidth;
    var IOboxY2 = IOboxY + IOboxHeight;
    var IOboxXCoord = map(x, -limX, limX, IOboxX, IOboxX2);
    var IOboxYCoord = map(y, limY, -limY, IOboxY, IOboxY2);
    return [IOboxXCoord, IOboxYCoord];
}
function invertFromIOBoxCoordinates(x, y) {
    // Convert the x and y coordinates from the box coordinates
    var IOboxX2 = IOboxX + IOboxWidth;
    var IOboxY2 = IOboxY + IOboxHeight;
    var xCoord = map(x, IOboxX, IOboxX2, -sqrt3, sqrt3);
    var yCoord = map(y, IOboxY, IOboxY2, sqrt3, -sqrt3);
    return [xCoord, yCoord];
}

function convertToKMBoxCoordinates(x, y, s=1, limX = sqrt3, limY = KMlimY) {
    var offset_s = 0;
    if (s==-1) {offset_s = KMboxHeight+35;}
    // Convert the x and y coordinates to the box coordinates
    var KMboxX2 = KMboxX + KMboxWidth;
    var KMboxY2 = KMboxY + KMboxHeight;
    var KMboxXCoord = map(x, -limX, limX, KMboxX, KMboxX2);
    var KMboxYCoord = map(y, limY, -limY, KMboxY + offset_s, KMboxY2 + offset_s);
    return [KMboxXCoord, KMboxYCoord];
}

function invertFromKMBoxCoordinates(x, y, s=1, limX = sqrt3, limY = KMlimY) {
    var offset_s = 0;
    if (s == -1) { offset_s = KMboxHeight + 35; }
    var KMboxX2 = KMboxX + KMboxWidth;
    var KMboxY2 = KMboxY + KMboxHeight;
    var xCoord = map(x, KMboxX, KMboxX2, -limX, limX);
    var yCoord = map(y, KMboxY + offset_s, KMboxY2 + offset_s, limY, -limY);
    return [xCoord, yCoord];
}

function convertToAWBoxCoordinates(x, y, limX = AWlimX, limY = AWlimY) {
    // Convert the x and y coordinates to the box coordinates
    var AWboxX2 = AWboxX + AWboxWidth;
    var AWboxY2 = AWboxY + AWboxHeight;
    var AWboxXCoord = map(x, -limX, limX, AWboxX, AWboxX2);
    var AWboxYCoord = map(y, limY, -limY, AWboxY, AWboxY2);
    return [AWboxXCoord, AWboxYCoord];
}

function invertFromAWBoxCoordinates(x, y, limX = AWlimX, limY = AWlimY) {
    // Convert the x and y coordinates from the AW box coordinates to AW space
    var AWboxX2 = AWboxX + AWboxWidth;
    var AWboxY2 = AWboxY + AWboxHeight;
    var wCoord = map(x, AWboxX, AWboxX2, -limX, limX);
    var aCoord = map(y, AWboxY, AWboxY2, limY, -limY);
    return [wCoord, aCoord];
}

function convertToWBBoxCoordinates(x, y, limX = WBlimX, limY = WBlimY) {
    // Convert the x and y coordinates to the box coordinates
    var WBboxX2 = WBboxX + WBboxWidth;
    var WBboxY2 = WBboxY + WBboxHeight;
    var WBboxXCoord = map(x, -limX, limX, WBboxX, WBboxX2);
    var WBboxYCoord = map(y, limY, -limY, WBboxY, WBboxY2);
    return [WBboxXCoord, WBboxYCoord];
}

function invertFromWBBoxCoordinates(x, y, limX = WBlimX, limY = WBlimY) {
    // Convert the x and y coordinates from the box coordinates to WB space
    var WBboxX2 = WBboxX + WBboxWidth;
    var WBboxY2 = WBboxY + WBboxHeight;
    var wCoord = map(x, WBboxX, WBboxX2, -limX, limX);
    var bCoord = map(y, WBboxY, WBboxY2, limY, -limY);
    return [wCoord, bCoord];
}

function prt(s){
    // print string s at the top of the canvas
    push();
    textSize(15);
    stroke(255); strokeWeight(1);
    // fill(0); stroke(0); strokeWeight(1);
    text(s, 10, 20);
    pop();
}

function checkMouseInArea(x, y, w, h) {
    // translate mouse coordinates to current frame of reference
    return (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h);
}

function checkMouseInRadius(x, y, r) {
    return (dist(mouseX, mouseY, x, y) < r);
}
