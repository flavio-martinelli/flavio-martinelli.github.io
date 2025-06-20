var toggleLearn = false;
var learnButton;

var learningRateSlider;
var inputBoxes = {};

var inputIOboxWidth = 60; // Horizontal size of input boxes

var teacherLabelColor = '#FF6666';
var studentLabelColor = '#6699FF';

var currentOption = 'Home'; // Default option

// Define graphics for the buttons

function styleCircularButton(button, color) {
    button.style('font-size', '32px');
    button.style('padding', '0');
    button.style('background-color', color);
    button.style('color', 'white');
    button.style('border', 'none');
    button.style('border-radius', '50%'); // Make the button circular
    button.style('width', '40px'); // Set width
    button.style('height', '40px'); // Set height
    button.style('display', 'flex');
    button.style('align-items', 'center');
    button.style('justify-content', 'center');
    button.style('cursor', 'pointer');
    button.style('line-height', '40px'); // Ensure text is vertically centered
    button.style('text-align', 'center'); // Ensure text is horizontally centered
}

// Setup all buttons

function setupButtons() {
    setupLearnButton(IOboxX + 10, 15); // learn button
    resetTeacherButton(IOboxX + 10 + 50, 15); // reset teacher parameters button
    resetStudentButton(IOboxX + 10 + 50*2, 15); // reset student parameters button
    resetTrajectoryButton(IOboxX + 10 + 50*3, 15); // reset trajectory button
    setupLRSlider(IOboxX + 20 + 50*4, 35); // learning rate slider
    displayDropdownMenu(540, 20); // dropdown menu
}

function displayDropdownMenu(x, y) {
    setupDropdownMenu(x, y, menuOptions, option_initializer);
    // display text left to the dropdown menu
    createDiv('Load initialization:')
        .position(x - 180, y -1)
        .parent('canvas-container')
        .style('font-size', '16px')
        .style('color', titleTextColor)
        .style('text-align', 'center') // Center the text horizontally
        .style('width', '200px'); // Set a fixed width to ensure centering
}

// Setup the dropdown menu

function setupDropdownMenu(x, y, options, onChangeCallback) {
    let dropdown = createSelect();
    dropdown.position(x, y).parent('canvas-container');
    options.forEach(opt => dropdown.option(opt));
    dropdown.changed(() => {
        let value = dropdown.value();
        currentOption = value; // Update the current option
        if (onChangeCallback) onChangeCallback(value);
        // mouseReleased(); // <-- Reset mouse state
        // Programmatically trigger mouseup on the canvas to reset p5.js drag state
        let canvas = document.querySelector('#canvas-container canvas');
        if (canvas) {
            let evt = new MouseEvent('mouseup', {bubbles: true});
            canvas.dispatchEvent(evt);
        }
    });
    return dropdown;
}

// Learn button

function setupLearnButton(x, y) {
    learnButton = createButton('\u23F5'); // Initial symbol is 'play'
    learnButton.position(x, y).parent('canvas-container'); // Position of the button
    learnButton.mousePressed(toggleLearnFunction); // Attach the callback function    
    styleCircularButton(learnButton, '#66CDAA'); // Style the button as circular
    addTooltip(learnButton, "Start/Stop learning"); // Add tooltip
}
function toggleLearnFunction() {
    toggleLearn = !toggleLearn;
    learnButton.html(toggleLearn ? '\u23F8' : '\u23F5'); // Toggle between 'play' and 'stop' symbols
}

// Reset buttons

function resetStudentButton(x, y) {
    var resetButton = createButton('↺');
    resetButton.position(x, y).parent('canvas-container');
    styleCircularButton(resetButton, studentLabelColor);
    resetButton.mousePressed(resetStudentParameters);
    addTooltip(resetButton, "Reset student");
}
function resetStudentParameters() {
    optionInits[currentOption][1]();
}
function resetTeacherButton(x, y) {
    var resetButton = createButton('↺');
    resetButton.position(x, y).parent('canvas-container');
    styleCircularButton(resetButton, teacherLabelColor);
    resetButton.mousePressed(resetTeacherParameters);
    addTooltip(resetButton, "Reset teacher");
}
function resetTeacherParameters() {
    optionInits[currentOption][0]();
}

// reset trajectory button

function resetTrajectoryButton(x, y) {
    var resetButton = createButton('⌫');
    resetButton.position(x, y).parent('canvas-container');
    styleCircularButton(resetButton, '#FFB347');
    resetButton.style('font-size', '22px');

    resetButton.mousePressed(resetTrajectory);
    addTooltip(resetButton, "Erase trajectories");
}
function resetTrajectory() {
    trajectoryKM = [];
    trajectoryAW = [];
    trajectoryWB = [];
    trajectorySkipIdxs = [];
    trajectoryLagCount = 0;
}

// Learning rate slider

function setupLRSlider(x, y) {
    createDiv('Learning Rate').position(x, y-23).parent('canvas-container');
    learningRateSlider = createSlider(-4, 0, -2, 0.1);
    learningRateSlider.position(x, y).parent('canvas-container');
    learningRateSlider.style('width', '100px');
}
function updateLRSlider() {
    var learning_rate = learningRateSlider.value();
}

// Input boxes

function setupParameterInputs() {
    var startingX = IOboxX + 35;
    var teacherOffsetY = 110;
    var studentOffsetY = 110; // Align student boxes with teacher boxes vertically
    var sepY = 30;  // Y separation between boxes
    var spaceTS = 125; // Space between teacher and student boxes
    var teacherColor = '#FFD6D6';
    var studentColor = '#D6EBFF';

    // TEACHER AND STUDENT LABELS
    createDiv("TEACHER")
        .position(startingX - 30, teacherOffsetY - 35)
        .parent('canvas-container')
        .style('font-size', '16px')
        .style('color', teacherLabelColor)
        .style('text-align', 'center') // Center the text horizontally
        .style('width', `${spaceTS - 30}px`); // Set a fixed width to ensure centring

    createDiv("STUDENT")
        .position(startingX + spaceTS - 30, studentOffsetY - 35)
        .parent('canvas-container')
        .style('font-size', '16px')
        .style('color', studentLabelColor)
        .style('text-align', 'center') // Center the text horizontally
        .style('width', `${1.8*spaceTS - 30}px`); // Set a fixed width to ensure centring

    // Teacher input boxes
    inputBoxes['mt'] = createInputBox('m^*', 'mt', startingX, teacherOffsetY, teacherColor).parent('canvas-container');
    inputBoxes['kt'] = createInputBox('k^*', 'kt', startingX, teacherOffsetY + sepY, teacherColor).parent('canvas-container');
    inputBoxes['ct'] = createInputBox('c^*', 'ct', startingX, teacherOffsetY + 2 * sepY, teacherColor).parent('canvas-container');
    inputBoxes['st'] = createInputBox('s^*', 'st', startingX, teacherOffsetY + 3 * sepY, teacherColor).parent('canvas-container');

    // Student input boxes
    inputBoxes['ms'] = createInputBox('m', 'ms', startingX + spaceTS, studentOffsetY, studentColor).parent('canvas-container');
    inputBoxes['ks'] = createInputBox('k', 'ks', startingX + spaceTS, studentOffsetY + sepY, studentColor).parent('canvas-container');
    inputBoxes['cs'] = createInputBox('c', 'cs', startingX + spaceTS, studentOffsetY + 2 * sepY, studentColor).parent('canvas-container');
    inputBoxes['ss'] = createInputBox('s', 'ss', startingX + spaceTS, studentOffsetY + 3 * sepY, studentColor).parent('canvas-container');
    inputBoxes['ws'] = createInputBox('w', 'ws', startingX + 1.8 * spaceTS, studentOffsetY, studentColor).parent('canvas-container');
    inputBoxes['bs'] = createInputBox('b', 'bs', startingX + 1.8 * spaceTS, studentOffsetY + sepY, studentColor).parent('canvas-container');
    inputBoxes['aS'] = createInputBox('a', 'aS', startingX + 1.8 * spaceTS, studentOffsetY + 2 * sepY, studentColor).parent('canvas-container');
    inputBoxes['rs']  = createInputBox('r', 'rs', startingX + 1.8 * spaceTS, studentOffsetY + 3 * sepY, studentColor).parent('canvas-container');
}

function createInputBox(label, variableName, x, y, col) {
    var latexLabel = `\\(${label}\\)`;
    var labelDiv = createDiv(latexLabel)
        .position(x - 35, y)
        .parent('canvas-container')
        .style('font-size', '14px')
        .style('height', '24px') // Set height to match input
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center')
        .style('vertical-align', 'middle') // Add this for vertical alignment
        .style('text-align', 'center') // Center the text horizontally
        .style('width', '30px'); // Set a fixed width to ensure centering

    MathJax.typesetPromise([labelDiv.elt]); // Render the LaTeX content

    // Add tooltip to the label
    if (explanations[variableName]) {
        addTooltip(labelDiv, explanations[variableName]);
    }

    stepRes = window[variableName] <= 1 ? 0.10 : 0.25; // Set the step size based on the value of the variable

    // Create the input box
    var input = createInput(window[variableName].toString(), 'number'); // Force only number reading
    input.position(x, y);
    input.parent('canvas-container');
    input.style('position', 'absolute');
    input.size(inputIOboxWidth);
    input.style('height', '24px');
    input.style('font-size', '14px')
    input.attribute('step', stepRes); // Set the step size to stepRes
    input.style('background-color', col); // Set the background color

    if (variableName === 'st' || variableName === 'ss') {
        input.attribute('step', 2); // Set the step size to 2
    }

    // Handle input changes
    input.input(() => {
        // handle the changes in the input box
        var newValue = parseFloat(input.value());
        if (!isNaN(newValue)) {
            window[variableName] = newValue; // Update the global variable directly
            if (interactions[variableName]) {
                interactions[variableName](); // Call the interaction function if it exists
            }
        } else {
            if (input.value() === '') {
                window[variableName] = 0;
            } else {
                console.log(`Invalid number for ${label}, reverting to previous value`); // Log invalid number
            }
        }
        // change precision of the step size: if value is between -1 and 1 set precision to 0.10. Otherwise set it to 0.25
        if (variableName !== 'st' && variableName !== 'ss') {
            if (Math.abs(newValue) <= 1) {
                input.attribute('step', 0.10);
            } else {
                input.attribute('step', 0.25);
            }
        }         
    });

    // ensure the input box is updated when the variable changes
    input.changed(() => {
        input.value(window[variableName].toFixed(2)); // Format the value to 2 decimal places on change
    });

    return input;
}

// Add tooltips to the labels
function addTooltip(element, text) {
    var tooltip = createDiv(text)
        .style('position', 'absolute')
        .style('background-color', 'rgba(255, 255, 255, 0.8)') // Set background to semi-transparent
        .style('border', '1px solid #ccc')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.1)')
        .style('display', 'none')
        .style('z-index', '10')
        .style('font-size', '11px') // Set font size to 11 pixels
        .style('color', '#000'); // Set text color to black

    element.mouseOver((evt) => {
        tooltip.style('display', 'block');
        tooltip.position(evt.pageX + 10, evt.pageY - 30);
    });

    element.mouseOut(() => {
        tooltip.style('display', 'none');
    });

    element.mouseMoved((evt) => {
        tooltip.position(evt.pageX + 10, evt.pageY - 30);
    });
}

function updateInputBoxes() {
    for (let key in inputBoxes) {
        var input = inputBoxes[key];
        var variable = window[key];
        if (parseFloat(input.value()).toFixed(2) !== variable.toFixed(2)) {
            input.value(variable.toFixed(2));
        }
        if (key === 'st' || key === 'ss') {
            input.value(Math.sign(variable)); // force the variable to be 1 or -1
            if (variable === 0) {
                input.value(1); 
            }
        }
    }
}