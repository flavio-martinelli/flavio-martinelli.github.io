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
    var canvas = createCanvas(733, 630);
    canvas.parent('canvas-container'); 
    // Set static objects
    setupParameterInputs();
    setupButtons();
    setupScaling(canvas.elt);
}

function setupScaling(canvasElt) {
    // Shrink the whole playground (canvas + DOM controls) on narrow screens with a CSS transform.
    var container = document.getElementById('canvas-container');
    var wrapper = document.createElement('div');
    container.parentNode.insertBefore(wrapper, container);
    wrapper.appendChild(container);
    container.style.margin = '0';
    container.style.transformOrigin = 'top left';
    // the site theme animates every property change over 0.75s, which makes rescaling lag behind the resize
    container.style.transition = 'none';
    wrapper.style.transition = 'none';
    // p5 maps mouse coordinates with scrollWidth/scrollHeight, which ignore transforms: report the on-screen size instead
    Object.defineProperty(canvasElt, 'scrollWidth', {get: () => canvasElt.getBoundingClientRect().width});
    Object.defineProperty(canvasElt, 'scrollHeight', {get: () => canvasElt.getBoundingClientRect().height});
    scalePlayground = function() {
        var parent = wrapper.parentElement;
        var style = getComputedStyle(parent);
        var availableW = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        // fit the height too, between the fixed navbar and the fixed footer, with a small margin
        var navbar = document.querySelector('nav.fixed-top');
        var footer = document.querySelector('footer.fixed-bottom');
        var availableH = window.innerHeight - (navbar ? navbar.offsetHeight : 0) - (footer ? footer.offsetHeight : 0) - 30;
        var s = Math.min(1, availableW / container.offsetWidth, availableH / container.offsetHeight);
        container.style.transform = 'scale(' + s + ')';
        wrapper.style.width = container.offsetWidth * s + 'px';
        wrapper.style.height = container.offsetHeight * s + 'px';
        wrapper.style.margin = '0 auto'; // centered in the page column
        wrapper.style.overflow = 'hidden'; // on narrow screens the unscaled layout box must not widen the page
    };
    scalePlayground();
}

var scalePlayground = function() {};

function windowResized() {
    scalePlayground();
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

    drawHoverTooltip();
}