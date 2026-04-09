let canvas3D;
let surface;
let font;

function getCanvasSize() {
    const parent = document.getElementById('canvas-3d');
    const availableW = parent ? parent.clientWidth : 410;
    const availableH = parent ? parent.clientHeight : 344;
    const w = Math.max(280, Math.min(410, availableW));
    // Prefer container CSS height so changing #canvas-3d height has visible effect.
    const h = Math.max(240, Math.min(420, availableH));
    return { w, h };
}

function preload() {
  font = loadFont('/assets/js/infinity/cmunvt.ttf'); // Preload the font. For 3D to work, we need a font file (not a linked font). 
}

// Define your custom surface function here
function mySurfaceFunction(x1, x2) {
    // Paraboloid
    return x1 * x1 + x2 * x2;
}

function setup() {
    const { w, h } = getCanvasSize();
    // Create 3D canvas
    canvas3D = createCanvas(w, h, WEBGL);
    canvas3D.parent('canvas-3d');
    
    // Create surface with your function
    // Parameters: function, xRange, yRange, resolution
    surface = new Surface3D((window.limitMode === 'approx' && typeof channelsToInfinityApprox === 'function') ? channelsToInfinityApprox : channelToInfinity, [-3, 3], [-3, 3], 40);
    // expose for other modules
    window.surface = surface;
    
    // Set isometric camera view with Z-axis pointing up
    const distance = 1250;
    const angle = Math.PI / 5; 
    const dx = -60;  // backwards
    const dy = -50;  // left
    const dz = -20;  // down
    cameraSetup(distance, angle, dx, dy, dz);
}

function draw() {
    background(240);
    
    // Enable orbit control (mouse panning)
    orbitControl();
    
    // Add some basic lighting
    ambientLight(60);
    directionalLight(255, 255, 255, 0.5, 0.5, -1);
    
    // Draw axes via helper
    drawAxes();

    // Draw the surface
    surface.drawMesh(); 

    // Draw axis labels
    textFont(font);
    textAlign(CENTER,CENTER);
    textSize(60);
    fill(0);

    push();
        translate(200, 250, 50);
        rotateX(-HALF_PI);
        text("x", 0, 0);
        push();
            translate(25, 15);
            textSize(35);
            text("1", 0, 0);
        pop();
    pop();

    push();
        translate(250, 200, 50);
        rotateY(HALF_PI);
        rotateZ(-HALF_PI);
        text("x", 0, 0);
        push();
            translate(25, 15);
            textSize(35);
            text("2", 0, 0);
        pop();
    pop();
    push();
        translate(250, -220, 220);
        rotateX(-HALF_PI);
        text("y", 0, 0);
    pop();
}

function windowResized() {
    const { w, h } = getCanvasSize();
    resizeCanvas(w, h);
}