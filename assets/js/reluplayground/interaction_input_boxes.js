var cached_ks = 0;
var cached_ms = 0;
var cacheable = true;

var interactions = {
    'st': function() {
        // Ensure st is either 1 or -1
        st = Math.sign(st);
        if (st === 0) {st = 1;}
    },
    'ss': function() {
        // Ensure ss is either 1 or -1 and update ws and bs signs
        ss = Math.sign(ss);
        if (ss === 0) {ss = 1;}
        ws = Math.abs(ws)*Math.sign(ss);
        bs = -Math.abs(bs)*Math.sign(ks)*Math.sign(ws);
    },
    'ms': function() {
        // rs = ws/as, ms = as*ws. We want to keep ms constant.
        // as = √(ms/rs), ws = as*rs, bs = -ks*ws
        if (ms === 0){
            // arbitrary choice here, when m is zero we set a to 0.
            aS = 0;
            return;
        }
        aS = Math.sign(ms) * Math.sqrt(Math.abs(ms/rs));
        ws = Math.sign(ss) * Math.abs(aS*rs);
        bs = -ks*ws;
    },
    'ws': function() {
        // update the m value accordingly
        ms = aS * Math.abs(ws);
        if (ws !== 0) {
            ks = -bs / ws;
        }
        else {ks = NaN;}
        ss = Math.sign(ws);
        if (ss === 0) {ss = 1;}
        rs = Math.abs(ws/aS);
    },
    'bs': function() {
        // update the ks value accordingly
        if (ws !== 0) {
            ks = -bs / ws;
        }
        else {ks = NaN;}
    },
    'aS': function() {
        // update the ms value accordingly
        ms = aS * Math.abs(ws);
        rs = Math.abs(ws/aS);
    },
    'ks': function() {
        // Interaction logic for ks
        bs = -ks*ws;
    },
    'rs': function() {
        // rs = ws/as, ms = as*ws. We want to keep ms constant.
        // as = √(ms/rs), ws = as*rs, bs = -ks*ws
        if (rs <= 0){
            rs = 0;
            ws = 0;
            if (cacheable) {
                cached_ks = ks;
                cached_ms = ms;
                cacheable = false;
            }
            ks = NaN;
            ms = 0;
            return;
        }
        // if ks was set to NaN while rs was 0, it needs to be returned to the ks prior to the NaN assignment. 
        // (ks cannot be inferred otherwise)
        if (rs > 0 && isNaN(ks)){  
            ks = cached_ks;
            ms = cached_ms;
        }
        aS = Math.sign(ms) * Math.sqrt(Math.abs(ms/rs));
        ws = Math.sign(ss) * Math.abs(aS*rs);
        bs = -ks*ws;
        cacheable = true;
    }
};