var toggleKinkTeacher = false;
var toggleKinkStudent = false;
var toggleSlopeStudent = false;
var toggleSlopeTeacher = false;
var toggleAWPoint = false;
var toggleWBPoint = false;
var toggleKMPointStudent = false;
var toggleKMPointTeacher = false;

function updateMouseEvents() {
    enlargeKinkTeacher();
    updateKinkTeacher();
    enlargeKinkStudent();
    updateKinkStudent();
    enlargeSlopeStudent();
    enlargeSlopeTeacher();
    updateSlopeTeacher();
    updateSlopeStudent();
    enlargeAWPoint();
    updateAWPoint();
    enlargeWBPoint();
    updateWBPoint();
    enlargeKMPoint();
    updateKMPointTeacher();
    updateKMPointStudent();
}

function updateKinkTeacher() {
    if (mouseIsPressed) {
        locked = (toggleKinkStudent || toggleSlopeStudent || toggleSlopeTeacher)
        if ((checkMouseInRadius(x, y, 10) && !locked) 
            || toggleKinkTeacher) {
            toggleKinkTeacher = true;
            [x, y] = invertFromIOBoxCoordinates(mouseX, mouseY);
            kt = constrain(x, -sqrt3, sqrt3);
            ct = constrain(y, -sqrt3, sqrt3);            
        }
    }
}

function updateKinkStudent() {
    if (mouseIsPressed) {
        locked = (toggleKinkTeacher || toggleSlopeStudent || toggleSlopeTeacher)
        if ((checkMouseInRadius(x, y, 10) && !locked) 
            || toggleKinkStudent) {
            toggleKinkStudent = true;
            [x, y] = invertFromIOBoxCoordinates(mouseX, mouseY);
            ks = constrain(x, -sqrt3, sqrt3);
            cs = constrain(y, -sqrt3, sqrt3);
            // update the bias accordingly
            bs = -ks*ws;
        }   
    }
}

function updateAWPoint() {
    if (mouseIsPressed) {
        var [x, y] = convertToAWBoxCoordinates(ws, aS);
        if (checkMouseInRadius(x, y, 10) || toggleAWPoint) {
            toggleAWPoint = true;
            var [newW, newA] = invertFromAWBoxCoordinates(mouseX, mouseY);
            ws = constrain(newW, -AWlimX, AWlimX);
            aS = constrain(newA, -AWlimY, AWlimY);
            rs = Math.abs(ws/aS);
            ms = aS * Math.abs(ws);
            ks = -bs / ws;
            ss = Math.sign(ws);
        }
    }
    else {
        toggleAWPoint = false;
    }
}

function updateWBPoint() {
    if (mouseIsPressed) {
        var [x, y] = convertToWBBoxCoordinates(ws, bs);
        if (checkMouseInRadius(x, y, 10) || toggleWBPoint) {
            toggleWBPoint = true;
            var [newW, newB] = invertFromWBBoxCoordinates(mouseX, mouseY);
            ws = constrain(newW, -WBlimX, WBlimX);
            bs = constrain(newB, -WBlimY, WBlimY);
            rs = Math.abs(ws/aS);
            ms = aS * Math.abs(ws);
            ks = -bs / ws;
            ss = Math.sign(ws);
        }
    } else {
        toggleWBPoint = false;
    }
}

function updateKMPointTeacher() {
    if (mouseIsPressed) {
        var [x, y] = convertToKMBoxCoordinates(kt, mt, st);
        
        var [negBoxX1, negBoxY1] = convertToKMBoxCoordinates(-KMlimX, KMlimY, -1);
        var [negBoxX2, negBoxY2] = convertToKMBoxCoordinates(KMlimX, -KMlimY, -1);
        mouseInNegKMBox =
            mouseX >= Math.min(negBoxX1, negBoxX2) && mouseX <= Math.max(negBoxX1, negBoxX2) &&
            mouseY >= Math.min(negBoxY1, negBoxY2) && mouseY <= Math.max(negBoxY1, negBoxY2);

        var [posBoxX1, posBoxY1] = convertToKMBoxCoordinates(-KMlimX, -KMlimY, 1);
        var [posBoxX2, posBoxY2] = convertToKMBoxCoordinates(KMlimX, KMlimY, 1);
        mouseInKMBoxPos =
            mouseX >= Math.min(posBoxX1, posBoxX2) && mouseX <= Math.max(posBoxX1, posBoxX2) &&
            mouseY >= Math.min(posBoxY1, posBoxY2) && mouseY <= Math.max(posBoxY1, posBoxY2);
        
        if ((checkMouseInRadius(x, y, 10) || toggleKMPointTeacher) && !toggleKMPointStudent) {
            toggleKMPointTeacher = true;
            var [newK, newM] = invertFromKMBoxCoordinates(mouseX, mouseY, st);
            kt = constrain(newK, -KMlimX, KMlimX);
            mt = constrain(newM, -KMlimY, KMlimY);
            if (st > 0 && mouseInNegKMBox) {
                st = -1;
            }
            else if (st < 0 && mouseInKMBoxPos) {
                st = 1;
            }
        }
    } else {
        toggleKMPointTeacher = false;
    }
}

function updateKMPointStudent() {
    if (mouseIsPressed) {
        var [x, y] = convertToKMBoxCoordinates(ks, ms, ss);

        var [negBoxX1, negBoxY1] = convertToKMBoxCoordinates(-KMlimX, KMlimY, -1);
        var [negBoxX2, negBoxY2] = convertToKMBoxCoordinates(KMlimX, -KMlimY, -1);
        var mouseInNegKMBox =
            mouseX >= Math.min(negBoxX1, negBoxX2) && mouseX <= Math.max(negBoxX1, negBoxX2) &&
            mouseY >= Math.min(negBoxY1, negBoxY2) && mouseY <= Math.max(negBoxY1, negBoxY2);

        var [posBoxX1, posBoxY1] = convertToKMBoxCoordinates(-KMlimX, -KMlimY, 1);
        var [posBoxX2, posBoxY2] = convertToKMBoxCoordinates(KMlimX, KMlimY, 1);
        var mouseInKMBoxPos =
            mouseX >= Math.min(posBoxX1, posBoxX2) && mouseX <= Math.max(posBoxX1, posBoxX2) &&
            mouseY >= Math.min(posBoxY1, posBoxY2) && mouseY <= Math.max(posBoxY1, posBoxY2);

        if ((checkMouseInRadius(x, y, 10) || toggleKMPointStudent) && !toggleKMPointTeacher) {
            toggleKMPointStudent = true;
            var [newK, newM] = invertFromKMBoxCoordinates(mouseX, mouseY, ss);
            ks = constrain(newK, -KMlimX, KMlimX);
            ms = constrain(newM, -KMlimY, KMlimY);
            if (ss > 0 && mouseInNegKMBox) {
                ss = -1;
            }
            else if (ss < 0 && mouseInKMBoxPos) {
                ss = 1;
            }
            aS = Math.sign(ms) * Math.sqrt(Math.abs(ms/rs));  // the sign of a is the same as the sign of m
            ws = Math.sign(ss) * Math.abs(aS*rs); // the sign of w is given by ss
            bs = -ks*ws;
        }
    } else {
        toggleKMPointStudent = false;
    }
}


function updateSlopeTeacher() {
    if (mouseIsPressed) {
        locked = (toggleSlopeStudent || toggleKinkStudent || toggleKinkTeacher)
        angle = st>0 ? -Math.atan(mt) : (Math.atan(mt) + Math.PI);
        push();
        [x, y] = convertToIOBoxCoordinates(kt, ct);
        translate(x,y);
        rotate(angle);
        [mx, my] = [mouseX-x, mouseY-y];
        [mx, my] = [mx*Math.cos(angle) + my*Math.sin(angle), -mx*Math.sin(angle) + my*Math.cos(angle)];    
        if (((mx > 30 && mx < 30 + 120 && my > -7.5 && my < -7.5 + 15) && !locked) || toggleSlopeTeacher) {
            rotate(-angle);
            [mx, my] = [mouseX-x, mouseY-y];
            toggleSlopeTeacher = true;
            // compute angle between [0,0] and [mx, my]
            newAngle = -atan2(my, mx);
            newAngle = st>0 ? newAngle : Math.PI-newAngle;
            // compute new slope
            mt = Math.tan(newAngle);
            // flip sign if necessary
            if (newAngle > Math.PI/2 && newAngle < 3*Math.PI/2 && st<0) {
                st = -st;
            }
            else if ((newAngle > Math.PI/2 || newAngle < -Math.PI/2)&&(st>0)) {
                st = -st;
            }
        }
        pop();
    }
}

function updateSlopeStudent() {
    if (mouseIsPressed) {
        locked = (toggleSlopeTeacher || toggleKinkStudent || toggleKinkTeacher)
        angle = ss>0 ? -Math.atan(ms) : (Math.atan(ms) + Math.PI);
        push();
        [x, y] = convertToIOBoxCoordinates(ks, cs);
        translate(x,y);
        rotate(angle);
        [mx, my] = [mouseX-x, mouseY-y];
        [mx, my] = [mx*Math.cos(angle) + my*Math.sin(angle), -mx*Math.sin(angle) + my*Math.cos(angle)];    
        // if mouse is in the box, update the slope
        if (((mx > 30 && mx < 30 + 120 && my > -7.5 && my < -7.5 + 15) && !locked) || toggleSlopeStudent) {
            rotate(-angle);
            [mx, my] = [mouseX-x, mouseY-y];
            toggleSlopeStudent = true;
            // compute angle between [0,0] and [mx, my]
            newAngle = -atan2(my, mx);
            newAngle = ss>0 ? newAngle : Math.PI-newAngle;
            // compute new slope
            new_ms = Math.tan(newAngle);
            delta = new_ms - ms;
            // flip sign if necessary
            if (newAngle > Math.PI/2 && newAngle < 3*Math.PI/2 && ss<0) {
                ss = -ss;
            }
            else if ((newAngle > Math.PI/2 || newAngle < -Math.PI/2)&&(ss>0)) {
                ss = -ss;
            }
            // update ws and aS equally in strengths
            ms = new_ms;
            aS = Math.sign(ms) * Math.sqrt(Math.abs(ms/rs));  // the sign of a is the same as the sign of m
            ws = Math.sign(ss) * Math.abs(aS*rs); // the sign of w is given by ss
            bs = -ks*ws;
        }
        pop();        
    }
}
