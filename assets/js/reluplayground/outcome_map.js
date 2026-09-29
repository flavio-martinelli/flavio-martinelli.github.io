// Outcome map: for every point of the W-A, W-B and K-M slices, run gradient descent from there
// (the other parameters fixed at their current values) and shade the point by where it ends up.

var showOutcomeMap = false;

var OUTCOME_TEACHER = 0, OUTCOME_LINEAR = 1, OUTCOME_DEAD = 2, OUTCOME_UNKNOWN = -1;
var outcomeColors = { // validated categorical slots (aqua, violet, amber), light and dark theme
    light: [[27, 175, 122], [74, 58, 167], [237, 161, 0]],
    dark:  [[25, 158, 112], [144, 133, 233], [201, 133, 0]],
};
var outcomeAlpha = 110;

var outcomeLR = 0.1;         // step size of the map's gradient descent
var outcomeMaxSteps = 8000;                     // first pass: fills most of the map
var outcomeRetrySteps = 25 * outcomeMaxSteps;   // second pass: resumes the runs the first pass left unresolved, once
var outcomeChunkSteps = 5000;                   // the second pass runs in chunks so a frame never blocks
var outcomeBudgetMs = 10;                       // compute time per frame, always used in full
// Pacing is only a floor on how fast results are revealed (row by row, all maps together): the simulation
// never waits for it, so on slow machines or heavy settings the maps fill as fast as they are computed.
var outcomeFirstPassFrames = 150;               // first pass is revealed over at least this many frames (~2.5 s)
var outcomeSecondPassFrames = 90;               // second pass is revealed over at least this many frames (~1.5 s)

function lossAndGrads(w, b, a, c, g) {
    // Exact population loss and gradients for x ~ U[-√3, √3] (the data grid in the limit of many points).
    // Between the kinks both relus are linear, so the residual δ = p + q x and all integrals are closed form.
    var R = sqrt3;
    var pts = [-R, R];
    if (w !== 0) { var xs = -b / w; if (xs > -R && xs < R) pts.push(xs); }
    if (kt > -R && kt < R) pts.push(kt);
    pts.sort((u, v) => u - v);
    var Ed = 0, Es = 0, Esx = 0, L = 0;
    for (let i = 0; i < pts.length - 1; i++) {
        var l = pts[i], u = pts[i + 1];
        if (u - l < 1e-12) continue;
        var mid = 0.5 * (l + u);
        var sAct = w * mid + b > 0, tAct = st * (mid - kt) > 0;
        var p = c - ct + (sAct ? a * b : 0) + (tAct ? mt * st * kt : 0);
        var q = (sAct ? a * w : 0) - (tAct ? mt * st : 0);
        var d1 = u - l, d2 = 0.5 * (u * u - l * l), d3 = (u * u * u - l * l * l) / 3;
        var I0 = p * d1 + q * d2, I1 = p * d2 + q * d3;
        Ed += I0;
        if (sAct) { Es += I0; Esx += I1; }
        L += p * p * d1 + 2 * p * q * d2 + q * q * d3;
    }
    var inv = 1 / (2 * R);
    Ed *= inv; Es *= inv; Esx *= inv;
    g.c = Ed; g.a = w * Esx + b * Es; g.b = a * Es; g.w = a * Esx;
    return 0.5 * L * inv;
}

function simulateOutcome(p, Ldead, maxSteps, stopWhenStationary) {
    // runs gradient descent on p = {w, b, a, c} in place, so an unresolved run can be resumed later
    var R = sqrt3, g = {}, Lprev = Infinity;
    var w = p.w, b = p.b, a = p.a, c = p.c;
    var out = OUTCOME_UNKNOWN, t;
    for (t = 0; t <= maxSteps; t++) {
        var L = lossAndGrads(w, b, a, c, g);
        if (L < 1e-3 * Ldead) { out = OUTCOME_TEACHER; break; }
        if (Math.max(b - w * R, b + w * R) <= 0) { out = OUTCOME_DEAD; break; } // inactive on all data: w, b, a never move again
        if (stopWhenStationary && t % 200 === 0) {
            if (Lprev - L < 1e-7 * Lprev) break;
            Lprev = L;
        }
        // step capped by the local curvature so large a, w, b (e.g. K-M at small r) don't blow up;
        // a scalar step only changes the speed along the gradient path, not the path
        var lr = Math.min(outcomeLR, 1 / (1 + 2 * a * a + Math.pow(R * Math.abs(w) + Math.abs(b), 2)));
        w -= lr * g.w; b -= lr * g.b; a -= lr * g.a; c -= lr * g.c;
        if (!(Math.abs(w) + Math.abs(b) + Math.abs(a) + Math.abs(c) < 1e3)) return OUTCOME_UNKNOWN; // diverged
    }
    p.w = w; p.b = b; p.a = a; p.c = c;
    if (out !== OUTCOME_UNKNOWN) return out;
    // traps are approached asymptotically with the kink sliding onto the data edge, so allow a small tolerance
    var tol = 0.02 * R * Math.abs(w);
    if (Math.max(b - w * R, b + w * R) <= tol) return OUTCOME_DEAD;   // inactive on (almost) all data
    if (Math.min(b - w * R, b + w * R) >= -tol) return OUTCOME_LINEAR; // active on (almost) all data
    return OUTCOME_UNKNOWN;
}

function outcomeMapParams(name) {
    // [w, b, a, c] for a point (x, y) of each slice, and the values the slice depends on
    if (name === 'AW') return { key: [bs, cs], at: (x, y) => [x, bs, y, cs] };
    if (name === 'WB') return { key: [aS, cs], at: (x, y) => [x, y, aS, cs] };
    var s = name === 'KMp' ? 1 : -1;
    return { key: [rs, cs], at: (k, m) => {
        if (!(rs > 0 && isFinite(rs))) return null; // r = 0: every (k, m) collapses to w = 0
        var a = Math.sign(m) * Math.sqrt(Math.abs(m / rs)); // same conversion as dragging in the K-M box
        var w = s * Math.abs(a * rs);
        return [w, -k * w, a, cs];
    }};
}

var outcomeMaps = null;

function setupOutcomeMaps() {
    var mk = (name, x, y, wPx, hPx, limX, limY, nx, ny) => ({
        name, x, y, wPx, hPx, limX, limY, nx, ny, key: null, img: createImage(nx, ny), filled: false,
        results: new Int8Array(nx * ny), // first-pass outcomes, waiting to be revealed
        next: 0,        // first pass: next cell to compute
        shown: 0,       // first pass: next cell to reveal
        pending: [],    // second pass: unresolved cells to resume, {idx, p, stepsLeft}
        resolved: [],   // second pass: finished cells waiting to be revealed, {idx, out}
        secondTotal: 0, // number of cells that went to the second pass
    });
    outcomeMaps = [
        mk('WB', WBboxX, WBboxY, WBboxWidth, WBboxHeight, WBlimX, WBlimY, 36, 36),
        mk('AW', AWboxX, AWboxY, AWboxWidth, AWboxHeight, AWlimX, AWlimY, 36, 36),
        mk('KMp', KMboxX, KMboxY, KMboxWidth, KMboxHeight, KMlimX, KMlimY, 50, 20),
        mk('KMn', KMboxX, KMboxY + KMboxHeight + KMgap, KMboxWidth, KMboxHeight, KMlimX, KMlimY, 50, 20),
    ];
}

function updateOutcomeMaps() {
    if (!showOutcomeMap) return;
    if (!outcomeMaps) setupOutcomeMaps();
    var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var teacherKey = [kt, st, mt, ct, theme];

    // restart a map when anything its slice depends on has changed (frozen while learning)
    if (!toggleLearn) {
        for (const m of outcomeMaps) {
            var key = JSON.stringify(teacherKey.concat(outcomeMapParams(m.name).key));
            if (key !== m.key) { m.key = key; m.next = 0; m.shown = 0; m.pending = []; m.resolved = []; m.secondTotal = 0; }
        }
    }

    // nothing left to compute or reveal: only the finished images get drawn
    if (outcomeMaps.every(m => m.shown >= m.nx * m.ny && !m.pending.length && !m.resolved.length)) return;

    // dead-neuron loss (best constant fit) sets the scale for "reached the teacher"
    var g = {};
    lossAndGrads(0, -1, 0, 0, g);
    var meanT = -g.c; // with the student off, E[δ] = -E[t]
    var Ldead = lossAndGrads(0, -1, 0, meanT, g);
    var cols = outcomeColors[theme];

    var setCell = (m, idx, out) => {
        var i4 = 4 * idx;
        if (out === OUTCOME_UNKNOWN) { m.img.pixels[i4 + 3] = 0; return; }
        m.img.pixels[i4] = cols[out][0]; m.img.pixels[i4 + 1] = cols[out][1]; m.img.pixels[i4 + 2] = cols[out][2];
        m.img.pixels[i4 + 3] = outcomeAlpha;
    };
    var t0 = performance.now();
    var outOfTime = () => performance.now() - t0 >= outcomeBudgetMs;

    // compute: use the whole budget, one cell (or one chunk) per map in turn
    var pars = outcomeMaps.map(m => outcomeMapParams(m.name));
    while (!outOfTime()) {
        var worked = false;
        outcomeMaps.forEach((m, k) => {
            if (outOfTime()) return;
            if (m.next < m.nx * m.ny) { // first pass
                var idx = m.next; // row by row, left to right
                var i = idx % m.nx, j = Math.floor(idx / m.nx);
                var x = m.limX * (-1 + (2 * i + 1) / m.nx);
                var y = m.limY * (1 - (2 * j + 1) / m.ny); // row 0 is the top of the box
                var q = pars[k].at(x, y);
                var out = OUTCOME_UNKNOWN;
                if (q && Ldead > 1e-12) {
                    var p = { w: q[0], b: q[1], a: q[2], c: q[3] };
                    out = simulateOutcome(p, Ldead, outcomeMaxSteps, true);
                    if (out === OUTCOME_UNKNOWN) { m.pending.push({ idx, p, stepsLeft: outcomeRetrySteps }); m.secondTotal++; }
                }
                m.results[idx] = out;
                m.next++;
                worked = true;
            } else if (m.pending.length) { // second pass, in chunks
                var cell = m.pending[0];
                var steps = Math.min(outcomeChunkSteps, cell.stepsLeft);
                cell.stepsLeft -= steps;
                var res = simulateOutcome(cell.p, Ldead, steps, false);
                if (res !== OUTCOME_UNKNOWN || cell.stepsLeft <= 0) { // resolved, or out of steps: stays blank
                    m.pending.shift();
                    m.resolved.push({ idx: cell.idx, out: res });
                }
                worked = true;
            }
        });
        if (!worked) break;
    }

    // reveal: at most a fixed share per frame, never more than what is already computed
    for (const m of outcomeMaps) {
        var n = m.nx * m.ny;
        m.img.loadPixels();
        if (m.shown < n) {
            var stop = Math.min(m.next, m.shown + Math.ceil(n / outcomeFirstPassFrames));
            for (; m.shown < stop; m.shown++) setCell(m, m.shown, m.results[m.shown]);
        } else {
            var count = Math.min(m.resolved.length, Math.ceil(m.secondTotal / outcomeSecondPassFrames));
            for (const cell of m.resolved.splice(0, count)) setCell(m, cell.idx, cell.out);
        }
        m.img.updatePixels();
        m.filled = true;
    }
}

function drawOutcomeMaps() {
    renderOutcomeLegend(); // only does work when the theme changed
    if (!showOutcomeMap || !outcomeMaps) return;
    push();
    var kmDefined = rs > 0 && isFinite(rs);
    for (const m of outcomeMaps) {
        if (!m.filled) continue;
        if (!kmDefined && m.name.startsWith('KM')) continue; // no K-M map at r = 0
        image(m.img, m.x, m.y, m.wPx, m.hPx); // upscaled with smoothing: soft edges between outcomes
    }
    pop();
}

var outcomeLegend = null, outcomeLegendTheme = null;

function renderOutcomeLegend() {
    // (re)draw the legend swatches and text color for the current theme
    var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    if (!outcomeLegend || theme === outcomeLegendTheme) return;
    outcomeLegendTheme = theme;
    var cols = outcomeColors[theme];
    var sw = (c, first) => `<span style="display:inline-block;width:9px;height:9px;border-radius:2px;margin:0 3px 0 ${first ? 0 : 8}px;background:rgb(${c.join(',')})"></span>`;
    outcomeLegend.html(sw(cols[0], true) + 'global' + sw(cols[1]) + 'linear' + sw(cols[2]) + 'dead');
    outcomeLegend.style('color', theme === 'dark' ? '#fff' : '#000');
}

function setupOutcomeButton(x, y, legendX, legendY, legendW) {
    outcomeLegend = createDiv('')
        .parent('canvas-container')
        .position(legendX, legendY)
        .style('width', legendW + 'px')
        .style('text-align', 'center')
        .style('font-size', '12px')
        .style('white-space', 'nowrap')
        .style('display', 'none');
    renderOutcomeLegend();
    var legend = outcomeLegend;

    var button = createButton(icons.mapOff);
    button.position(x, y).parent('canvas-container');
    styleCircularButton(button, '#9085e9');
    addTooltip(button, "Outcome map");
    button.mousePressed(() => {
        showOutcomeMap = !showOutcomeMap;
        button.html(showOutcomeMap ? icons.mapOn : icons.mapOff); // cross over the bullseye while on
        legend.style('display', showOutcomeMap ? 'block' : 'none');
    });
}
