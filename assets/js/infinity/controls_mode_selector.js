// Mode selector: choose between limiting to Infinity or using an approximation.

(function setupModeSelector() {
    // Ensure a global exists
    window.limitMode = window.limitMode || 'infty'; // 'infty' or 'approx'

    function createSelector(container) {
        const row = document.createElement('div');
        row.className = 'mode-selector-row';

        function makeOption(value, labelText) {
            const opt = document.createElement('div');
            opt.className = 'mode-option';

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'mode-dot';
            dot.setAttribute('aria-pressed', value === window.limitMode ? 'true' : 'false');
            if (value === window.limitMode) dot.classList.add('selected');

            const lbl = document.createElement('div');
            lbl.className = 'mode-label';
            lbl.textContent = labelText;

            opt.appendChild(dot);
            opt.appendChild(lbl);

            function select() {
                window.limitMode = value;
                // update visuals
                row.querySelectorAll('.mode-dot').forEach(d => {
                    d.classList.remove('selected');
                    d.setAttribute('aria-pressed', 'false');
                });
                dot.classList.add('selected');
                dot.setAttribute('aria-pressed', 'true');
                // re-render controls panel layout for the selected mode (if provided)
                if (typeof window.setupControlsSliders === 'function') {
                    window.setupControlsSliders();
                }
                // Update surface function binding according to mode, then trigger regenerate
                if (window.surface) {
                    if (value === 'approx' && typeof channelsToInfinityApprox === 'function') {
                        window.surface.func = channelsToInfinityApprox;
                    } else {
                        window.surface.func = channelToInfinity;
                    }
                    if (typeof window.surface.generatePoints === 'function') window.surface.generatePoints();
                }
                if (typeof window.redrawControlsCanvas === 'function') window.redrawControlsCanvas();
            }

            dot.addEventListener('click', select);
            // allow clicking label too
            lbl.addEventListener('click', select);

            return opt;
        }

        // Option 1: limit to ∞
        row.appendChild(makeOption('infty', 'exact limit'));
        // Option 2: approximation
        row.appendChild(makeOption('approx', "approximation"));

        container.appendChild(row);
    }

    function insertIntoPanel() {
        const panel = document.getElementById('controls-sliders-panel');
        const parent = document.getElementById('controls-container');
        if (panel) {
            createSelector(panel);
        } else if (parent) {
            // put it near the top of controls if sliders panel isn't present
            createSelector(parent);
        } else {
            // fallback: append to body
            createSelector(document.body);
        }
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', insertIntoPanel);
    } else {
        insertIntoPanel();
    }
})();
