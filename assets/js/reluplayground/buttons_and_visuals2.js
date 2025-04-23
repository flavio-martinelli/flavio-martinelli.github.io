var toggleLearn = false;
var learnButton;

var learningRateSlider;
var inputBoxes = {};

var inputIOboxWidth = 60; // Horizontal size of input boxes

var teacherLabelColor = '#FF6666';
var studentLabelColor = '#6699FF';

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
    button.style('font-family', 'Arial'); 
}

// Setup all buttons

function setupButtons() {
    let container = document.getElementById('canvas-container');
    let rect = container.getBoundingClientRect(); // Get the bounding rectangle of the container for relative positioning
    setupLearnButton(IOboxX + 20, 15, rect); // learn button
    resetTeacherButton(IOboxX + 20 + 50, 15, rect); // reset teacher parameters button
    resetStudentButton(IOboxX + 20 + 50*2, 15, rect); // reset student parameters button
    resetTrajectoryButton(IOboxX + 20 + 50*3, 15, rect); // reset trajectory button
    setupLRSlider(IOboxX + 30 + 50*4, 35, rect); // learning rate slider
}

// Learn button

function setupLearnButton(x, y, rect) {
    learnButton = createButton('\u23F5'); // Initial symbol is 'play'
    learnButton.position(rect.left + x, rect.top + y);
    learnButton.mousePressed(toggleLearnFunction); // Attach the callback function    
    styleCircularButton(learnButton, '#66CDAA'); // Style the button as circular
    addTooltip(learnButton, "Start/Stop learning"); // Add tooltip
}
function toggleLearnFunction() {
    toggleLearn = !toggleLearn;
    learnButton.html(toggleLearn ? '\u23F8' : '\u23F5'); // Toggle between 'play' and 'stop' symbols
}

// Reset buttons

function resetStudentButton(x, y, rect) {
    var resetButton = createButton('↺');
    resetButton.position(rect.left + x, rect.top + y);
    styleCircularButton(resetButton, studentLabelColor);
    resetButton.mousePressed(resetStudentParameters);
    addTooltip(resetButton, "Reset student");
}
function resetStudentParameters() {
    ks = 0.0;
    ss = 1;
    ms = 1.0;
    cs = 0.0;
    ws = 1;
    bs = 0.0;
    aS = 1.0;
    rs = Math.abs(ws/aS);
}
function resetTeacherButton(x, y, rect) {
    var resetButton = createButton('↺');
    resetButton.position(rect.left + x, rect.top + y);
    styleCircularButton(resetButton, teacherLabelColor);
    resetButton.mousePressed(resetTeacherParameters);
    addTooltip(resetButton, "Reset teacher");
}
function resetTeacherParameters() {
    kt = 0.5;
    st = 1;
    mt = 0.5;
    ct = -0.5;
}

// reset trajectory button

function resetTrajectoryButton(x, y, rect) {
    var resetButton = createButton('⌫');
    resetButton.position(rect.left + x, rect.top + y);    
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

function setupLRSlider(x, y, rect) {
    createDiv('Learning Rate')
        .position(rect.left + x, rect.top + y - 20)
        .parent('canvas-container');
    learningRateSlider = createSlider(-4, 0, -2, 0.1);
    learningRateSlider.position(rect.left + x, rect.top + y).parent('canvas-container');
    learningRateSlider.style('width', '100px');
}
function updateLRSlider() {
    var learning_rate = learningRateSlider.value();
}

// Input boxes

function setupParameterInputs() {
    var startingX = IOboxX + 45;
    var teacherOffsetY = 110;
    var studentOffsetY = 110; // Align student boxes with teacher boxes vertically
    var sepY = 30;  // Y separation between boxes
    var spaceTS = 125; // Space between teacher and student boxes
    var teacherColor = '#FFD6D6';
    var studentColor = '#D6EBFF';

    let container = document.getElementById('canvas-container');
    let rect = container.getBoundingClientRect();

    // TEACHER AND STUDENT LABELS
    createDiv("TEACHER")
        .position(rect.left + startingX - 30, rect.top + teacherOffsetY - 35)
        .parent('canvas-container')
        .style('font-size', '16px')
        .style('color', teacherLabelColor)
        .style('text-align', 'center') // Center the text horizontally
        .style('width', `${spaceTS - 30}px`); // Set a fixed width to ensure centring

    createDiv("STUDENT")
        .position(rect.left + startingX + spaceTS - 15, rect.top + studentOffsetY - 35)
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
    let container = document.getElementById('canvas-container');
    let rect = container.getBoundingClientRect();
    var labelDiv = createDiv(latexLabel)
        .position(rect.left + x - 30, rect.top + y)
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
    let container = document.getElementById('canvas-container');
    let rect = container.getBoundingClientRect();
    var tooltip = createDiv(text)
        .parent('canvas-container')
        .style('position', 'absolute')
        .style('background-color', 'rgba(255, 255, 255, 0.8)') // Set background to semi-transparent
        .style('border', '1px solid #ccc')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.1)')
        .style('display', 'none')
        .style('z-index', '10')
        .style('font-size', '11px'); // Set font size to 11 pixels

    element.mouseOver(() => {
        tooltip.style('display', 'block');
        tooltip.position(mouseX + 10, mouseY - 30); // Position the tooltip above the mouse cursor
    });

    element.mouseOut(() => {
        tooltip.style('display', 'none');
    });

    element.mouseMoved(() => {
        tooltip.position(rect.left + mouseX + 10, rect.top + mouseY - 30);
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