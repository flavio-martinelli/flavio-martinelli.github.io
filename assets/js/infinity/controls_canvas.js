// controls: small p5 instance that draws two simple axes inside the
// `#controls-container`. Using a p5 instance avoids colliding with the
// global `setup()`/`draw()` used by the main sketch.
function controlsSketch(p) {
    // store canvas and density in the closure for resize handling
    let cnv = null;
    let currentDensity = 1;
    p.setup = function() {
        const parentEl = document.getElementById('controls-container');
        if (!parentEl) return;

        const h = 150;
        const w = Math.min(parentEl.clientWidth, 260);
        const cnvLocal = p.createCanvas(w, h);
        // Parent the canvas directly to the controls container (no wrapper)
        cnvLocal.parent('controls-container');
        // give the canvas an id for styling if needed
        cnvLocal.id('controls-canvas');
        // keep simple density (1) to match original behavior
        p.pixelDensity(2);
        p.noLoop(); // static unless we need interaction
    };

    p.draw = function() {
        // White background
        p.background(240);
        drawControlsCanvasBackground(p);
        drawParallelControlsArrows(p);
    };

    // Ensure hover visuals update as the mouse moves even though we use noLoop()
    p.mouseMoved = function() {
        p.redraw();
    };
    p.touchMoved = function() {
        p.redraw();
        return false;
    };

    // Interaction: drag either parallel arrow tip along the circumference.
    p.mousePressed = function() {
        const state = window.parallelArrowsState = window.parallelArrowsState || { theta: 30 * Math.PI / 180, dragging: false, activeTip: null };
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        const radius = Math.min(p.width, p.height) / 3;
        const theta = state.theta;
        const tip1 = { x: centerX + radius * Math.cos(theta), y: centerY + radius * Math.sin(theta) };
        const tip2 = { x: centerX + radius * Math.cos(theta + Math.PI), y: centerY + radius * Math.sin(theta + Math.PI) };
        const mx = p.mouseX;
        const my = p.mouseY;
        const thr = 14; // px proximity threshold
        // first, detect green-arrow body click (rectangular halo)
        // ensure greenAngle exists
        if (state.greenAngle === undefined || state.greenAngle === null) {
            const pad = 10;
            const originX = pad;
            const originY = p.height - pad;
            state.greenAngle = Math.atan2(centerY - originY, centerX - originX);
        }
        const uAngle = state.greenAngle;
        // match the visual parameters in controls_parallel_arrows.js
        const greenTailLength = radius * 3; // same factor used when drawing the green tail
        // keep these in sync with controls_parallel_arrows.js visual values
        const rectLen = greenTailLength * 0.8;
        const rectW = 25;
        const distFromTip = greenTailLength * 0.6; // same offset used for the visual halo
        const rectCenterX = centerX - Math.cos(uAngle) * distFromTip;
        const rectCenterY = centerY - Math.sin(uAngle) * distFromTip;
        let handled = false;
        // pointInRotatedRect is defined in controls_parallel_arrows.js
        if (typeof pointInRotatedRect === 'function') {
            if (pointInRotatedRect(mx, my, rectCenterX, rectCenterY, rectLen, rectW, uAngle)) {
                state.draggingGreen = true;
                handled = true;
            }
        }
        // if not clicking green body, fall back to tip detection
        if (!handled) {
            if (p.dist(mx, my, tip1.x, tip1.y) < thr) {
                state.dragging = true;
                state.activeTip = 1;
            } else if (p.dist(mx, my, tip2.x, tip2.y) < thr) {
                state.dragging = true;
                state.activeTip = 2;
            }
        }
    };

    p.mouseDragged = function() {
        const state = window.parallelArrowsState;
        if (!state) return;
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        // if dragging the green body, update its orientation so its TIP remains at center
        if (state.draggingGreen) {
            // angle pointing toward center from mouse: tip remains at center
            const newA = Math.atan2(centerY - p.mouseY, centerX - p.mouseX);
            state.greenAngle = newA;
            p.redraw();
            return;
        }
        if (!state.dragging) return;
        // compute angle from center to mouse
        let a = Math.atan2(p.mouseY - centerY, p.mouseX - centerX);
        if (state.activeTip === 1) {
            state.theta = a;
        } else if (state.activeTip === 2) {
            state.theta = a - Math.PI;
        }
        // normalize
        state.theta = ((state.theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        p.redraw();
    };

    p.mouseReleased = function() {
        const state = window.parallelArrowsState;
        if (state) {
            state.dragging = false;
            state.activeTip = null;
            state.draggingGreen = false;
        }
    };
}

// Instantiate the p5 instance (named function style)
new p5(controlsSketch);
