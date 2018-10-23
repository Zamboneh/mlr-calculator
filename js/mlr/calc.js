// calc.js - all the stuff related to calculating an AB
// a lot of this is (c) /u/aviator157

function getDifference(pitch, swing) {
    var max = Math.max(pitch, swing);
    var min = Math.min(pitch, swing);
    var result = Math.min(max - min, 1000 - max + min);
    console.log("Diff: " + result);
    return result;
}

function getResult(pitcher, pitch, batter, swing) {
    var diff = getDifference(pitch, swing);

    // 1. get batter/pitcher ranges
    // 2. combine ranges
    // 3. calculate any modifiers to ranges (TODO)
    // 4. look up diff in final range

    var batterRange = window.batterRanges[batter.types.batter];
    console.log("batter range...");
    console.log(batterRange);
    var pitcherRange = window.pitcherRanges[pitcher.types.pitcher];
    console.log("pitcher range...");
    console.log(pitcherRange);
    var handRange = window.handRanges[pitcher.types.bonus];
    console.log("hand range...");
    console.log(handRange);

    finalRange = combineRanges(batterRange, pitcherRange);
    if (pitcher.hand == batter.hand) {
        finalRange = combineRanges(finalRange, handRange);
    }
    console.log("Combined...");
    console.log(finalRange);

    var diffCounter = diff;
    var finalResult;
    var fields = ["HR", "3B", "2B", "1B", "BB", "FO", "K", "PO", "RGO", "LGO"];
    for (var i = 0; i < fields.length; i++) {
        var abResult = fields[i];
        diffCounter -= finalRange[abResult];
        if (diffCounter <= 0) {
            finalResult = abResult;
            break;
        }
    }

    return {
        result: finalResult,
        diff: diff,
        range: finalRange
    };
}

function combineRanges(range1, range2) {
    // combines outcomes of range1 and range2 and returns a sum range
    var fields = ["HR", "3B", "2B", "1B", "BB", "FO", "K", "PO", "RGO", "LGO"];
    var sumRange = {};
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        sumRange[field] = getAsNumber(range1[field]) + getAsNumber(range2[field]);
    }
    return sumRange;
}

function getAsNumber(input) {
    var inputType = typeof(input);
    if (inputType == "string") {
        return parseInt(input);
    } else if (inputType == "number") {
        return input;
    }
    return null;
}

function doCalc() {    
    var pitch = parseInt($('#pitcherNumber').val());
    var swing = parseInt($('#batterNumber').val());

    var result = getResult(window.currentPitcher, pitch, window.currentBatter, swing);

    if (result == null) {
        $('#result').html("Methinks one of these players is missing a type or hand...");
    } else {
        $('#result').html("Swing: " + swing + "  <br/>Pitch: " + pitch + "  <br/>Diff: " + result.diff + " -> " + result.result);
    }
}

// Swing: x
// Pitch: y
// Diff: z -> 3B