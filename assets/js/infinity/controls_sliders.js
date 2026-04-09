// Sliders for controlling channel parameters `a` and `c`.

// Ensure globals exist with defaults
window.a = (typeof window.a === 'number') ? window.a : 1;
window.c = (typeof window.c === 'number') ? window.c : 0;
// Defaults for approximation mode
window.epsilon = (typeof window.epsilon === 'number') ? window.epsilon : 0.1;
if (typeof window.a1a2diff !== 'number') {
    const aDef = (typeof window.a === 'number') ? window.a : 1;
    const epsDef = (typeof window.epsilon === 'number') ? window.epsilon : 0.1;
    // allow model value to exceed slider max or go below 1; slider will remain clamped
    window.a1a2diff = Math.max(1e-12, aDef / epsDef);
}

function setupControlsSliders() {
    const parent = document.getElementById('controls-container');

    // Create (or reuse) a sliders panel so we can style its background and spacing
    let panel = document.getElementById('controls-sliders-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'controls-sliders-panel';
        parent.appendChild(panel);
    }

    // Clear and re-render panel contents so we can switch layouts dynamically
    panel.innerHTML = '';

    // Activation dropdown (placed at top of the panel)
    // Ensure a default activation exists
    window.activation = window.activation || 'relu';
    const actRow = document.createElement('div');
    actRow.style.display = 'flex';
    actRow.style.alignItems = 'center';
    actRow.style.gap = '8px';
    actRow.style.padding = '6px 12px';

    const actLabel = document.createElement('div');
    actLabel.textContent = 'activation';
    actLabel.style.fontSize = '14px';
    actLabel.style.width = '48px';
    actRow.appendChild(actLabel);

    const actSelect = document.createElement('select');
    const options = [
        { v: 'relu', t: 'relu' },
        { v: 'softplus', t: 'softplus' },
        { v: 'gelu', t: 'gelu' },
        { v: 'swish', t: 'swish' },
        { v: 'sigmoid', t: 'sigmoid' },
        { v: 'tanh', t: 'tanh' },
        { v: 'linear', t: 'linear' },
        { v: 'square', t: 'square' },
        { v: 'cube', t: 'cube' },
    ];
    options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.v;
        opt.textContent = o.t;
        actSelect.appendChild(opt);
    });
    actSelect.value = window.activation;
    actSelect.style.width = '150px';
    actSelect.style.marginLeft = '30px';
    actRow.appendChild(actSelect);
    panel.appendChild(actRow);

    actSelect.addEventListener('change', () => {
        window.activation = actSelect.value;
        if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
    });

    // layout: use plain DOM so elements appear independently of p5 timing
    function makeRow(labelText, initialValue) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';
        row.style.padding = '6px 12px';

        const lbl = document.createElement('div');
        lbl.textContent = labelText;
        lbl.style.fontSize = '14px';
        lbl.style.width = '32px';
        // center the label text horizontally and vertically
        lbl.style.display = 'flex';
        lbl.style.alignItems = 'center';
        lbl.style.justifyContent = 'center';
        lbl.style.textAlign = 'center';
        row.appendChild(lbl);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = -3;
        slider.max = 3;
        slider.step = 0.1;
        slider.value = initialValue;
        slider.style.width = '110px';
        row.appendChild(slider);

        const input = document.createElement('input');
        input.type = 'number';
        input.step = 0.1;
        input.value = initialValue;
        input.style.width = '80px';
        row.appendChild(input);

        panel.appendChild(row);
        return { row, lbl, slider, input };
    }

    // shared references so handlers outside the approx-block can update controls
    let aControls, cControls;
    let eSlider, eInput, gSlider, gInput;
    // formatting helpers (used by multiple handlers)
    const formatEps = v => {
        if (v >= 0.01 && v <= 1) return Number(v).toPrecision(3);
        return Number(v).toExponential(3);
    };
    const formatGamma = v => {
        if (v >= 1 && v <= 100) return Number(v).toPrecision(3);
        return Number(v).toExponential(3);
    };
    // Helper: update numeric input always, but only move slider if value is representable
    function safeSetControl(slider, input, value, formatFn, isLog = false) {
        if (!input) return;
        // Update numeric display
        input.value = formatFn ? formatFn(value) : value;
        if (!slider) return;
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const sliderVal = isLog ? Math.log10(value) : value;
        if (!isNaN(sliderVal) && sliderVal >= min && sliderVal <= max) {
            slider.value = sliderVal;
        }
    }
    // If approx mode, create epsilon & γ (labelled a₁ - a₂) first
    if (window.limitMode === 'approx') {
        // epsilon and gamma use log-scale sliders: slider is exponent, value = 10^exp
        const eControls = makeRow('ε', window.epsilon);
        const gControls = makeRow('a₁- a₂', window.a1a2diff);
        aControls = makeRow('a', window.a);
        cControls = makeRow('c', window.c);

        eSlider = eControls.slider;
        eInput = eControls.input;
        // numeric input should not step below tiny positive value
        eInput.min = 1e-5;
        // epsilon: 1e-2 .. 1  => exponent range [-2, 0]
        eSlider.min = -2;
        eSlider.max = 0;
        eSlider.step = 0.01;
        safeSetControl(eSlider, eInput, window.epsilon, formatEps, true);
        eSlider.addEventListener('input', () => {
            const exp = parseFloat(eSlider.value);
            const v = Math.pow(10, exp);
            window.epsilon = v;
            eInput.value = formatEps(v);
            // keep derived a1a2diff in sync: a1a2diff = a / epsilon (always update model)
            const aVal = (typeof window.a === 'number') ? window.a : 1;
            const newDiff = Math.max(1e-12, aVal / v);
            window.a1a2diff = newDiff;
            // update gamma controls (they store exponent) safely
            safeSetControl(gSlider, gInput, newDiff, formatGamma, true);
            if (typeof window.redrawControlsCanvas === 'function') window.redrawControlsCanvas();
            if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
        });
        eInput.addEventListener('input', () => {
            const v = parseFloat(eInput.value);
            if (!isNaN(v) && v > 0) {
                    // allow user to enter epsilon outside slider range; only prevent non-positive
                    const clamped = Math.max(1e-12, v);
                window.epsilon = clamped;
                safeSetControl(eSlider, eInput, clamped, formatEps, true);
                const aVal = (typeof window.a === 'number') ? window.a : 1;
                const newDiff = Math.max(1e-12, aVal / clamped);
                window.a1a2diff = newDiff;
                safeSetControl(gSlider, gInput, newDiff, formatGamma, true);
                if (typeof window.redrawControlsCanvas === 'function') window.redrawControlsCanvas();
                if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
            }
        });

        gSlider = gControls.slider;
        gInput = gControls.input;
        // allow numeric input to go outside slider range but remain positive
        gInput.min = 1e-5;
        // a1a2diff: 1 .. 1e2 => exponent range [0, 2]
        gSlider.min = 0;
        gSlider.max = 2;
        gSlider.step = 0.01;
        safeSetControl(gSlider, gInput, window.a1a2diff, formatGamma, true);
        gSlider.addEventListener('input', () => {
            const exp = parseFloat(gSlider.value);
            const v = Math.pow(10, exp);
            window.a1a2diff = v;
            safeSetControl(gSlider, gInput, v, formatGamma, true);
            // keep epsilon consistent: epsilon = a / a1a2diff (update model; slider may stay clamped)
            const aVal = (typeof window.a === 'number') ? window.a : 1;
            const recip = Math.max(1e-12, aVal / v);
            window.epsilon = recip;
            safeSetControl(eSlider, eInput, recip, formatEps, true);
            if (typeof window.redrawControlsCanvas === 'function') window.redrawControlsCanvas();
            if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
        });
        gInput.addEventListener('input', () => {
            const v = parseFloat(gInput.value);
            if (!isNaN(v) && v > 0) {
                // allow manual values outside slider range; ensure positive
                const clamped = Math.max(1e-12, v);
                window.a1a2diff = clamped;
                safeSetControl(gSlider, gInput, clamped, formatGamma, true);
                    const aVal = (typeof window.a === 'number') ? window.a : 1;
                    const recip = Math.max(1e-12, aVal / clamped);
                window.epsilon = recip;
                safeSetControl(eSlider, eInput, recip, formatEps, true);
                    if (typeof window.redrawControlsCanvas === 'function') window.redrawControlsCanvas();
                if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
            }
        });
    } else {
        aControls = makeRow('a', window.a);
        cControls = makeRow('c', window.c);
    }
    const aSlider = aControls.slider;
    const aInput = aControls.input;
    // a ranges 0..3
    aSlider.min = 0;
    aSlider.max = 3;
    aSlider.step = 0.01;
    aInput.min = 0;
    aInput.max = 3;
    const cSlider = cControls.slider;
    const cInput = cControls.input;

    // Handlers to keep slider/input/global in sync (native DOM events)
    aSlider.addEventListener('input', () => {
        const v = parseFloat(aSlider.value);
        window.a = v;
        safeSetControl(aSlider, aInput, v, vv => Number(vv).toFixed(2), false);
        // update derived a1a2diff = a / epsilon (always update model)
            const eps = window.epsilon || 1e-2;
        const newDiff = Math.max(1e-12, window.a / eps);
        window.a1a2diff = newDiff;
        safeSetControl(gSlider, gInput, newDiff, formatGamma, true);
        // update surface if present
        if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
    });
    aInput.addEventListener('input', () => {
        const v = parseFloat(aInput.value);
        if (!isNaN(v)) {
            window.a = v;
            safeSetControl(aSlider, aInput, v, vv => Number(vv).toFixed(2), false);
            // update derived a1a2diff = a / epsilon (always update model)
            const eps = window.epsilon || 1e-2;
            const newDiff = Math.max(1e-12, window.a / eps);
            window.a1a2diff = newDiff;
            safeSetControl(gSlider, gInput, newDiff, formatGamma, true);
            if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
        }
    });

    cSlider.addEventListener('input', () => {
        const v = parseFloat(cSlider.value);
        window.c = v;
        cInput.value = v.toFixed(2);
        if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
    });
    cInput.addEventListener('input', () => {
        const v = parseFloat(cInput.value);
        if (!isNaN(v)) {
            window.c = v;
            cSlider.value = v;
            if (window.surface && typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
        }
    });
}

// Run setup once DOM is ready
window.addEventListener('DOMContentLoaded', setupControlsSliders);

// expose for other modules to re-render when mode changes
window.setupControlsSliders = setupControlsSliders;
