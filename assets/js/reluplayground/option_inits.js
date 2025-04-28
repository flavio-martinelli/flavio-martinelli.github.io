function option_initializer(selected) {
    // call function from optionInits
    if (optionInits[selected]) {
        optionInits[selected].forEach(fn => fn());
        // redraw the boxes, relus, and input boxes
        drawBoxes();
        drawRelu(kt, st, mt, ct, teacherLabelColor);
        drawRelu(ks, ss, ms, cs, studentLabelColor, b=bs);  
        updateInputBoxes();  
        mouseReleased();
    } else {
        console.error('No initialization function found for:', selected);
    }
}

function setTeacherParams({ktVal, stVal, mtVal, ctVal}) {
    kt = ktVal;
    st = stVal;
    mt = mtVal;
    ct = ctVal;
}

function setStudentParams({ksVal, ssVal, msVal, csVal, wsVal, aSVal, bsVal, rsVal}) {
    ks = ksVal;
    ss = ssVal;
    ms = msVal;
    cs = csVal;
    ws = wsVal;
    aS = aSVal;
    bs = bsVal;
    rs = rsVal;
}

var menuOptions = ['Home', 
    'Out sign change (i)', 
    'Out sign change (ii)',
    'Out sign change (iii)',
    'In sign change (i)',
    'In sign change (ii)',
    'In sign change (iii)',
    'In sign change (iv)'];

const optionInits = {
    'Home': [
        () => setTeacherParams({
            ktVal: 0.5,
            stVal: 1,
            mtVal: 0.5,
            ctVal: -0.5
        }),
        () => setStudentParams({
            ksVal: 0.0,
            ssVal: 1,
            msVal: 1.0,
            csVal: 0.0,
            wsVal: 1.0,
            aSVal: 1.0,
            bsVal: 0.0,
            rsVal: Math.abs(1.0/1.0)
        })
    ],
    'Out sign change (i)': [
        () => setTeacherParams({
            ktVal: 0.0,
            stVal: 1,
            mtVal: 0.5,
            ctVal: 0.0
        }),
        () => setStudentParams({
            ksVal: 0.0,
            ssVal: 1,
            msVal: -1.0,
            csVal: 0.0,
            wsVal: 1.0,
            aSVal: -1.0,
            bsVal: 0.0,
            rsVal: Math.abs(2.0/2.0)
        })
    ],
    'Out sign change (ii)': [
        () => setTeacherParams({
            ktVal: 0.0,
            stVal: 1,
            mtVal: 0.5,
            ctVal: 0.0
        }),
        () => setStudentParams({
            ksVal: 0.0,
            ssVal: 1,
            msVal: -1.0,
            csVal: 0.0,
            wsVal: 4/3,
            aSVal: -3/4,
            bsVal: 0.0,
            rsVal: Math.abs((4/3)/(-3/4))
        })
    ],
    'Out sign change (iii)': [
        () => setTeacherParams({
            ktVal: 0.0,
            stVal: 1,
            mtVal: 0.5,
            ctVal: 0.0
        }),
        () => setStudentParams({
            ksVal: 0.0,
            ssVal: 1,
            msVal: -1.0,
            csVal: 0.0,
            wsVal: 92/82,
            aSVal: -82/92,
            bsVal: 0.0,
            rsVal: Math.abs((92/82)/(-82/92))
        })
    ],
    'In sign change (i)': [
        () => setTeacherParams({
            ktVal: 0.0,
            stVal: 1,
            mtVal: 0.5,
            ctVal: 0.0
        }),
        () => setStudentParams({
            ksVal: 0.0,
            ssVal: -1,
            msVal: 1.0,
            csVal: 0.0,
            wsVal: -3/4,
            aSVal: 4/4,
            bsVal: 0.0,
            rsVal: Math.abs((-3/4)/(4/3))
        })
    ],
    'In sign change (ii)': [
        () => setTeacherParams({
            ktVal: 0.0,
            stVal: 1,
            mtVal: 0.5,
            ctVal: 0.0
        }),
        () => setStudentParams({
            ksVal: 0.0,
            ssVal: -1,
            msVal: 1.0,
            csVal: 0.0,
            wsVal: -4/3,
            aSVal: 3/4,
            bsVal: 0.0,
            rsVal: Math.abs((-4/3)/(3/4))
        })
    ],
    'In sign change (iii)': [
        () => setTeacherParams({
            ktVal: 0.0,
            stVal: 1,
            mtVal: 0.5,
            ctVal: 0.0
        }),
        () => setStudentParams({
            ksVal: -(0.8)/(-3/4),
            ssVal: -1,
            msVal: 1.0,
            csVal: 0.0,
            wsVal: -3/4,
            aSVal: 4/3,
            bsVal: 0.8,
            rsVal: Math.abs((-3/4)/(4/3))
        })
    ],
    'In sign change (iv)': [
        () => setTeacherParams({
            ktVal: 0.0,
            stVal: 1,
            mtVal: 0.5,
            ctVal: 0.0
        }),
        () => setStudentParams({
            ksVal: -(1.1)/(-3/4),
            ssVal: -1,
            msVal: 1.0,
            csVal: 0.0,
            wsVal: -3/4,
            aSVal: 4/3,
            bsVal: 1.1,
            rsVal: Math.abs((-3/4)/(4/3))
        })
    ],
};