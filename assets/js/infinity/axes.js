// Axes drawing utility for the 3D scene

function drawAxes() {
    strokeWeight(2);
    stroke(0);

    // X axis
    line(-200, 250, 0, 200, 250, 0);
    // X tick marks
    strokeWeight(1);
    line(-200, 260, 0, -200, 240, 0);
    line(0, 260, 0, 0, 240, 0);
    line(200, 260, 0, 200, 240, 0);

    // Y axis (moved to the other side in X)
    strokeWeight(2);
    line(250, -200, 0, 250, 200, 0);
    // Y tick marks
    strokeWeight(1);
    line(260, -200, 0, 240, -200, 0);
    line(260, 0, 0, 240, 0, 0);
    line(260, 200, 0, 240, 200, 0);

    // Z axis 
    strokeWeight(2);
    line(250, -250, -200, 250, -250, 200);
    // Z tick marks
    strokeWeight(1);
    line(260, -250, -200, 240, -250, -200);
    line(260, -250, 0, 240, -250, 0);
    line(260, -250, 200, 240, -250, 200);    
}

// Draw background for the controls canvas (instance-mode p5)
// This draws the small 2D axes, an arrow from bottom-left to canvas center,
// and a green label 'w' near the arrow tip.
function drawControlsCanvasBackground(p) {
    // compute density as backing pixels / CSS pixels (fallback to 1)
    const elt = p && p.canvas && p.canvas.elt;
    const cssW = (elt && (elt.clientWidth || (elt.getBoundingClientRect && elt.getBoundingClientRect().width))) || p.width;
    const cssH = (elt && (elt.clientHeight || (elt.getBoundingClientRect && elt.getBoundingClientRect().height))) || p.height;
    const d = (p.width && cssW) ? (p.width / cssW) : 1;

    // derive a few key coordinates directly in backing pixels
    const pad = 10 * d;
    const len = 20 * d;
    const centerX = (cssW / 2) * d;
    const centerY = (cssH / 2) * d;
    // place the small axes at the bottom-left corner
    const axesOriginX = pad;
    const axesOriginY = (cssH - 10) * d;
    const radius = (Math.min(cssW, cssH) / 3) * d;

    p.push();

    // dashed circumference around canvas center (behind other elements)
    p.push();
    p.noFill();
    p.stroke('#bcbbbbff');
    p.strokeWeight(1 * d);
    const dashLen = 8 * d; // px
    const gapLen = 6 * d; // px
    const dashAngle = dashLen / radius;
    const gapAngle = gapLen / radius;
    let a = 0;
    while (a < Math.PI * 2) {
        const start = a;
        const end = Math.min(a + dashAngle, Math.PI * 2);
        p.arc(centerX, centerY, radius * 2, radius * 2, start, end);
        a += dashAngle + gapAngle;
    }
    p.pop();

    // axis labels (drawn near the bottom-left axes)
    p.fill(0);
    p.textSize(14 * d);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('x₁', axesOriginX + len + 6 * d, axesOriginY - 2 * d);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text('x₂', axesOriginX, axesOriginY - len - 6 * d);
    // axes (bottom-left): horizontal goes right, vertical goes up
    p.stroke(0);
    p.strokeWeight(2 * d);
    p.line(axesOriginX, axesOriginY, axesOriginX + len, axesOriginY);
    p.line(axesOriginX, axesOriginY, axesOriginX, axesOriginY - len);

    p.pop();
}
