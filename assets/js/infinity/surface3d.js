// Surface plotting utilities

// Activation mapping: maps the `window.activation` string to an
// activation function `act(z)` and its derivative `act_prime(z)`.
// This mapping is defined at file scope so other modules can reuse it.
const ACTIVATIONS = {
    relu: {
        act: (z) => Math.max(0, z),
        act_prime: (z) => (z > 0 ? 1 : 0)
    },
    softplus: {
        act: (z) => Math.log(1 + Math.exp(z)),
        act_prime: (z) => 1 / (1 + Math.exp(-z)) // sigmoid
    },
    gelu: {
        // Approximate GELU using tanh approximation
        act: (z) => {
            const k = Math.sqrt(2 / Math.PI);
            const z3 = z * z * z;
            const t = k * (z + 0.044715 * z3);
            return 0.5 * z * (1 + Math.tanh(t));
        },
        // Derivative of the tanh-approx GELU (analytical approximation)
        act_prime: (z) => {
            const k = Math.sqrt(2 / Math.PI);
            const z2 = z * z;
            const z3 = z * z2;
            const t = k * (z + 0.044715 * z3);
            const tanhT = Math.tanh(t);
            const sech2 = 1 - tanhT * tanhT;
            const dt_dz = k * (1 + 0.134145 * z2); // derivative of (z + 0.044715 z^3)
            return 0.5 * (1 + tanhT) + 0.5 * z * sech2 * dt_dz;
        }
    },
    swish: {
        // Swish with beta=1: z * sigmoid(z)
        act: (z) => {
            const s = 1 / (1 + Math.exp(-z));
            return z * s;
        },
        // derivative: s + z * s * (1 - s)
        act_prime: (z) => {
            const s = 1 / (1 + Math.exp(-z));
            return s + z * s * (1 - s);
        }
    },
    sigmoid: {
        act: (z) => 1 / (1 + Math.exp(-z)),
        act_prime: (z) => {
            const s = 1 / (1 + Math.exp(-z));
            return s * (1 - s);
        }
    },
    tanh: {
        act: (z) => Math.tanh(z),
        act_prime: (z) => 1 - Math.tanh(z) * Math.tanh(z)
    },
    linear: {
        act: (z) => z,
        act_prime: (z) => 1
    },
    square: {
        act: (z) => z * z,
        act_prime: (z) => 2 * z
    },
    cube: {
        act: (z) => z * z * z,
        act_prime: (z) => 3 * z * z
    },
};

// Helper to obtain the current activation pair. Falls back to ReLU.
function getActivationFunctions() {
    const key = (window.activation || 'relu');
    return ACTIVATIONS[key] || ACTIVATIONS['relu'];
}

function channelToInfinity(x, y){
    // Read parameters and angles from globals (concise fallbacks)
    const a = window.a ?? 1;
    const c = window.c ?? 0;
    const wnorm = 1;
    const wgreen = window.getWAngle ? window.getWAngle() : 0;
    const wangle = { x: Math.cos(wgreen), y: Math.sin(wgreen) };
    const w = { x: wnorm * wangle.x, y: wnorm * wangle.y };
    const deltaAngle = window.getW1ToW2VectorAngle();
    const Delta = { x: Math.cos(deltaAngle), y: Math.sin(deltaAngle) };
    // Get activation functions according to the selected activation dropdown
    const { act, act_prime } = getActivationFunctions();
    return c*act(x*w.x + y*w.y) + a*(x*Delta.x + y*Delta.y)*act_prime(x*w.x + y*w.y);
}

function channelsToInfinityApprox(x, y) {
    // Read parameters and angles from globals (concise fallbacks)
    const a = window.a ?? 1;
    const c = window.c ?? 0;
    const epsilon = window.epsilon ?? 0.1;
    const wnorm = 1;
    const wgreen = window.getWAngle ? window.getWAngle() : 0;
    const wangle = { x: Math.cos(wgreen), y: Math.sin(wgreen) };
    const w = { x: wnorm * wangle.x, y: wnorm * wangle.y };
    const deltaAngle = window.getW1ToW2VectorAngle();
    const Delta = { x: Math.cos(deltaAngle), y: Math.sin(deltaAngle) };
    const { act, act_prime } = getActivationFunctions();

    const w1 = { x: w.x + epsilon * Delta.x, y: w.y + epsilon * Delta.y};
    const w2 = { x: w.x - epsilon * Delta.x, y: w.y - epsilon * Delta.y};

    const avgNeuron = c/2 * (act(x*w1.x + y*w1.y) + act(x*w2.x + y*w2.y));
    const diffNeuron = (a/(2*epsilon)) * (act(x*w1.x + y*w1.y) - act(x*w2.x + y*w2.y));
    
    return avgNeuron + diffNeuron;
}


class Surface3D {
    constructor(func, xRange = [-2, 2], yRange = [-2, 2], resolution = 30) {
        this.func = func; // Function that takes (x, y) and returns z
        this.xMin = xRange[0];
        this.xMax = xRange[1];
        this.yMin = yRange[0];
        this.yMax = yRange[1];
        this.resolution = resolution; // Number of points per axis
        this.points = [];
        this.generatePoints();
    }
    
    generatePoints() {
        this.points = [];
        const xStep = (this.xMax - this.xMin) / (this.resolution - 1);
        const yStep = (this.yMax - this.yMin) / (this.resolution - 1);
        
        for (let i = 0; i < this.resolution; i++) {
            for (let j = 0; j < this.resolution; j++) {
                const x = this.xMin + i * xStep;
                const y = this.yMin + j * yStep;
                const z = this.func(x, y);
                this.points.push({x, y, z});
            }
        }
    }
    
    draw(pointSize = 4, colorFunc = null) {
        push();
        strokeWeight(pointSize);
        
        for (let p of this.points) {
            // Scale points for better visualization
            const scaledX = p.x * 100;
            const scaledY = p.y * 100;
            const scaledZ = p.z * 100;
            
            // Color based on height if colorFunc provided, otherwise use default
            if (colorFunc) {
                const col = colorFunc(p.z);
                stroke(col);
            } else {
                // Default: color by height (blue to red)
                const t = map(p.z, -1, 1, 0, 1);
                const r = lerp(50, 255, t);
                const b = lerp(255, 50, t);
                stroke(r, 100, b);
            }
            
            // Draw point using vertex in a point primitive
            beginShape(POINTS);
            vertex(scaledX, scaledY, scaledZ);
            endShape();
        }
        
        pop();
    }
    
    drawMesh(meshColor = null) {
        push();
        
        strokeWeight(0.5);
        stroke(50);
        
        const xStep = (this.xMax - this.xMin) / (this.resolution - 1);
        const yStep = (this.yMax - this.yMin) / (this.resolution - 1);
        
        // Draw filled grid squares
        for (let j = 0; j < this.resolution - 1; j++) {
            beginShape(QUAD_STRIP);
            for (let i = 0; i < this.resolution; i++) {
                const x = this.xMin + i * xStep;
                const y = this.yMin + j * yStep;
                const z = this.func(x, y);
                
                // Color based on height
                if (meshColor) {
                    fill(meshColor);
                } else {
                    const t = map(z, -1, 1, 0, 1);
                    const r = lerp(50, 255, t);
                    const b = lerp(255, 50, t);
                    fill(r, 100, b);
                }
                
                vertex(x * 100, y * 100, z * 100);
                
                // Next row
                const y2 = this.yMin + (j + 1) * yStep;
                const z2 = this.func(x, y2);
                const t2 = map(z2, -1, 1, 0, 1);
                const r2 = lerp(50, 255, t2);
                const b2 = lerp(255, 50, t2);
                
                if (meshColor) {
                    fill(meshColor);
                } else {
                    fill(r2, 100, b2);
                }
                
                vertex(x * 100, y2 * 100, z2 * 100);
            }
            endShape();
        }
        
        pop();
    }
}

// Example surface functions
function exampleFunction1(x, y) {
    // Simple paraboloid
    return x * x + y * y;
}

function exampleFunction2(x, y) {
    // Saddle surface (hyperbolic paraboloid)
    return x * x - y * y;
}

function exampleFunction3(x, y) {
    // Sine wave surface
    return Math.sin(x) * Math.cos(y);
}

function exampleFunction4(x, y) {
    // Gaussian-like bump
    return Math.exp(-(x * x + y * y));
}

function exampleFunction5(x, y) {
    // Ripple effect
    const r = Math.sqrt(x * x + y * y);
    return r === 0 ? 1 : Math.sin(r * 3) / (r * 3);
}
