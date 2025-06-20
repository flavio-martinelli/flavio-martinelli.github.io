var kt = 0.5;
var st = 1;
var mt = 0.5;
var ct = -0.5;

var ks = 0.0;
var ss = 1;
var ms = 1.0;
var cs = 0.0;
var ws = 1.0;
var aS = 1.0;
var bs = 0.0;
var rs = Math.abs(ws/aS); // ratio of ws to aS, only used in the buttons

var data = createData(); // data to train the network on (ranges from -sqrt(3) to sqrt(3))

function setup() {
    var canvas = createCanvas(720, 625);
    canvas.parent('canvas-container'); 
    // Set static objects
    setupParameterInputs();
    setupButtons();
}

function mouseReleased() {
    toggleKinkTeacher = false;
    toggleKinkStudent = false;
    toggleSlopeTeacher = false;
    toggleSlopeStudent = false;
}

function draw() {
    defineColorsOnTheme();
    
    background(backgroundColor);

    drawText();
    drawBoxes();

    drawRelu(kt, st, mt, ct, teacherLabelColor);
    drawRelu(ks, ss, ms, cs, studentLabelColor, b=bs);

    // Handles mouse events
    updateMouseEvents();
    // Update and display the learning rate slider
    updateLRSlider();
    // Update and display the input boxes
    updateInputBoxes();

    // Learn if button is toggled
    if (toggleLearn) {
        learning_rate = Math.pow(10, learningRateSlider.value());
        var upds = computeUpdates(data, kt, st, mt, ct, cs, ws, bs, aS, learning_rate);
        ks = upds[0];
        ss = upds[1];
        ms = upds[2];
        cs = upds[3];
        ws = upds[4];
        aS = upds[5];
        bs = upds[6];
        rs = Math.abs(ws/aS);
    }
}