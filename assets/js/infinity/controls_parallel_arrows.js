// Draw two arrows parallel to the green reference arrow and the green arrow itself.
// - The two dark arrows have their tips constrained to the dashed circle (antipodal via theta).
// - The green arrow has its tip fixed at the canvas center; its body shows a rectangular
//   halo that can be clicked (not too close to the tip) and dragged to rotate the green arrow.
// - While dragging the green arrow, the two dark arrows remain parallel to it.
function drawParallelControlsArrows(p) {
    const pad = 10;
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const radius = Math.min(p.width, p.height) / 3;

    // state (extend if missing)
    window.parallelArrowsState = window.parallelArrowsState || {
        theta: 0 * Math.PI / 180,
        dragging: false,
        activeTip: null,
        draggingGreen: false,
        greenAngle: -90 * Math.PI / 180,
        labelAngleDeg: -60
    };
    const state = window.parallelArrowsState;

    // initialize greenAngle to the previous default arrow direction (bottom-left -> center)
    if (state.greenAngle === null) {
        const originX = pad;
        const originY = p.height - pad;
        state.greenAngle = Math.atan2(centerY - originY, centerX - originX);
    }

    // --- compute positions for the two parallel arrows' tips (on circle) ---
    const theta = state.theta;
    const tip1X = centerX + radius * Math.cos(theta);
    const tip1Y = centerY + radius * Math.sin(theta);
    const tip2X = centerX + radius * Math.cos(theta + Math.PI);
    const tip2Y = centerY + radius * Math.sin(theta + Math.PI);

    const greenTailLength = radius * 3; // tail sits near/just outside the dashed circle

    const hoverRadius = 14;

    p.push();
    const mx = p.mouseX;
    const my = p.mouseY;

    // tip hover indicators (soft grey circle)
    p.noStroke();
    p.fill(180, 180, 180, 40);
    if (p.dist(mx, my, tip1X, tip1Y) < hoverRadius) p.ellipse(tip1X, tip1Y, hoverRadius * 2, hoverRadius * 2);
    if (p.dist(mx, my, tip2X, tip2Y) < hoverRadius) p.ellipse(tip2X, tip2Y, hoverRadius * 2, hoverRadius * 2);

    // --- draw the two parallel dark arrows; their orientation matches greenAngle ---
    const uAngle = state.greenAngle;
    const ux = Math.cos(uAngle);
    const uy = Math.sin(uAngle);
    const mainLength = 350; // sufficiently large base offset so arrows appear to originate off-canvas

    const tailX = centerX - ux * greenTailLength;
    const tailY = centerY - uy * greenTailLength;

    let blackBlend = 0;
    if (window.limitMode === 'approx') {
        const epsilon = (typeof window.epsilon === 'number') ? window.epsilon : 0.1;
        if (epsilon > 0.01) {
            blackBlend = Math.min(1, Math.max(0, Math.log10(epsilon / 0.01) / 2));
        }
    }

    const parallelBase1X = tip1X - ux * mainLength;
    const parallelBase1Y = tip1Y - uy * mainLength;
    const parallelBase2X = tip2X - ux * mainLength;
    const parallelBase2Y = tip2Y - uy * mainLength;

    const base1X = parallelBase1X + (tailX - parallelBase1X) * blackBlend;
    const base1Y = parallelBase1Y + (tailY - parallelBase1Y) * blackBlend;
    const base2X = parallelBase2X + (tailX - parallelBase2X) * blackBlend;
    const base2Y = parallelBase2Y + (tailY - parallelBase2Y) * blackBlend;

    drawArrow(p, base1X, base1Y, tip1X, tip1Y, { color: '#323232', weight: 3, headSize: 12 });
    drawArrow(p, base2X, base2Y, tip2X, tip2Y, { color: '#323232', weight: 3, headSize: 12 });

    // tip labels placed at a configurable angle relative to the arrow direction
    p.noStroke();
    p.fill(0);
    p.textSize(16);
    const labelAngleDeg = (state.labelAngleDeg !== undefined && state.labelAngleDeg !== null) ? state.labelAngleDeg : 90;
    const labelAngle1 = Math.atan2(tip1Y - base1Y, tip1X - base1X) + labelAngleDeg * Math.PI / 180;
    const labelAngle2 = Math.atan2(tip2Y - base2Y, tip2X - base2X) + labelAngleDeg * Math.PI / 180;
    const labelOffset = 18; // px away from tip along the chosen angle
    const label1X = tip1X + Math.cos(labelAngle1) * labelOffset;
    const label1Y = tip1Y + Math.sin(labelAngle1) * labelOffset;
    const label2X = tip2X + Math.cos(labelAngle2) * labelOffset;
    const label2Y = tip2Y + Math.sin(labelAngle2) * labelOffset;
    p.textAlign(p.CENTER, p.CENTER);
    p.text('w₁', label1X, label1Y);
    p.text('w₂', label2X, label2Y);

    // --- draw the green reference arrow whose TIP is fixed at the center ---
    // green arrow tail placed along -u from center
    // draw green arrow via helper (head at center)
    drawArrow(p, tailX, tailY, centerX, centerY, { color: '#27b562', weight: 3, headSize: 12 });

    // label 'w' near the center tip, placed perpendicular to the green arrow
    p.noStroke();
    p.fill('#27b562');
    p.textSize(18);
    // place the green label using the same configurable label angle
    const greenLabelAngle = uAngle + labelAngleDeg * Math.PI / 180;
    const greenLabelOffset = 18;
    const greenLabelX = centerX + Math.cos(greenLabelAngle) * greenLabelOffset;
    const greenLabelY = centerY + Math.sin(greenLabelAngle) * greenLabelOffset;
    p.textAlign(p.CENTER, p.CENTER);
    p.text('w', greenLabelX, greenLabelY);

    // --- rectangular halo along the green arrow body to indicate clickable/draggable area ---
    // rectangle placed lower than the tip (further toward the tail) so it doesn't overlap the tip
    const rectLen = greenTailLength * 0.8; // length of the halo rectangle along the shaft
    const rectW = 25; // visual width
    // move the halo further from the tip (increase fraction)
    const distFromTip = greenTailLength * 0.6; // moved lower along the shaft
    const rectCenterX = centerX - ux * distFromTip;
    const rectCenterY = centerY - uy * distFromTip;

    // only draw the halo when hovered or actively dragging the green arrow
    const insideCanvas = mx >= 0 && my >= 0 && mx <= p.width && my <= p.height;
    const hoveringGreen = insideCanvas && pointInRotatedRect(mx, my, rectCenterX, rectCenterY, rectLen, rectW, uAngle);
    if (state.draggingGreen || hoveringGreen) {
        p.push();
        p.translate(rectCenterX, rectCenterY);
        p.rotate(uAngle);
        p.rectMode(p.CENTER);
        p.noStroke();
        // stronger fill when dragging, lighter on hover
        p.fill(state.draggingGreen ? '#27b56288' : '#27b56255');
        p.rect(0, 0, rectLen, rectW, 6);
        p.pop();
    }

    p.pop();
}

// helper: point-in-rotated-rectangle test
function pointInRotatedRect(px, py, cx, cy, rectLen, rectW, angle) {
    // translate point into rect-centered coordinates
    const dx = px - cx;
    const dy = py - cy;
    // rotate by -angle
    const ca = Math.cos(-angle);
    const sa = Math.sin(-angle);
    const rx = dx * ca - dy * sa;
    const ry = dx * sa + dy * ca;
    return Math.abs(rx) <= rectLen / 2 && Math.abs(ry) <= rectW / 2;
}

// expose for other scripts
window.drawParallelControlsArrows = drawParallelControlsArrows;

// --- convenience getters for external code ---
// Returns angle of green `w` arrow (radians, in canvas coordinates, 0 = +x)
window.getWAngle = function() {
    const s = window.parallelArrowsState || {};
    return (typeof s.greenAngle === 'number') ? s.greenAngle : 0;
};
window.getWAngleDeg = function() {
    return window.getWAngle() * 180 / Math.PI;
};

// Returns the theta used for placing w1 (radians). Tip2 is at theta + PI.
window.getW1TipAngle = function() {
    const s = window.parallelArrowsState || {};
    return (typeof s.theta === 'number') ? s.theta : 0;
};
window.getW1TipAngleDeg = function() { return window.getW1TipAngle() * 180 / Math.PI; };

// Returns the angle (radians) of the vector from w1 to w2 (i.e., tip2 - tip1).
// This is equivalent to theta + PI (normalized).
window.getW1ToW2VectorAngle = function() {
    const theta = window.getW1TipAngle();
    const a = theta + Math.PI;
    // normalize to [0, 2PI)
    return ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
};
window.getW1ToW2VectorAngleDeg = function() { return window.getW1ToW2VectorAngle() * 180 / Math.PI; };

// Utility: set green angle (radians) programmatically and request a redraw.
window.setWAngle = function(rad) {
    window.parallelArrowsState = window.parallelArrowsState || {};
    window.parallelArrowsState.greenAngle = rad;
    // trigger a synthetic mousemove so the controls instance redraws
    const el = document.querySelector('#controls-canvas');
    if (el) el.dispatchEvent(new MouseEvent('mousemove'));
};
