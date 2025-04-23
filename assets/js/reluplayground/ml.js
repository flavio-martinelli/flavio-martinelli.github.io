function relu(x) { 
    // Relu implementation for scalar inputs (graphical purposes only)
    return nj.max([0, x]);
}

function reluV(x) {
    // Relu implementation for vector inputs using nj (ml purposes)
    return nj.clip(x, 0, 100000000);
}

function reluDerivativeV(x) {
    // Relu derivative implementation for vector inputs using nj
    y = nj.zeros(x.shape);
    for (i = 0; i < x.shape; i++) {
        if (x.get(i) > 0) {
            y.set(i, 1.0);
        } else {
            y.set(i, 0.0);
        }
    }
    return y;
}

function createData() {
    // Using numjs create a linspace from -sqrt(3) to sqrt(3) with 100 points
    return nj.arange(-Math.sqrt(3), Math.sqrt(3)+Math.sqrt(3)/100, Math.sqrt(3)/100);
}

function computeError(x, kt, st, mt, ct, ws, bs, aS, cs) {
    // Compute the error between the teacher and student ReLU
    // out = relu(s*(x-k))*m + c
    s_out = reluV(nj.multiply(x,ws).add(bs)).multiply(aS).add(cs);
    t_out = reluV(nj.subtract(x,kt).multiply(st)).multiply(mt).add(ct);
    errors = nj.subtract(s_out, t_out);
    return errors;
}

function computeGradient(x, kt, st, mt, ct, ws, bs, aS, cs) {
    // Compute the loss gradient of all student parameters
    // L = 1/2 * errors^2
    // errors = relu(ws*x+bs)*aS + cs - teacher(x)
    // z = relu(ws*x+bs)
    // ∂L/∂cs = errors
    // ∂L/∂aS = errors * z
    // ∂L/∂bs = errors * aS * relu'(z)
    // ∂L/∂ws = errors * aS * relu'(z) * x
    zs = reluV(nj.multiply(x, ws).add(bs));
    errors = computeError(x, kt, st, mt, ct, ws, bs, aS, cs);
    csGrad = errors;
    asGrad = errors.multiply(zs);
    mask_z = reluDerivativeV(zs);
    bsGrad = errors.multiply(aS).multiply(mask_z);
    wsGrad = bsGrad.multiply(x);
    return [csGrad, asGrad, bsGrad, wsGrad];
}

function computeUpdates(x, kt, st, mt, ct, cs, ws, bs, aS, lr) {
    // Compute the updates for all student parameters
    grads = computeGradient(x, kt, st, mt, ct, ws, bs, aS, cs);
    c = cs - lr * nj.mean(grads[0]);
    a = aS - lr * nj.mean(grads[1]);
    b = bs - lr * nj.mean(grads[2]);
    w = ws - lr * nj.mean(grads[3]);
    s = Math.sign(w);
    m = a * Math.abs(w);
    k = -b/w;
    return [k, s, m, c, w, a, b];
}

