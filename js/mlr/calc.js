// calc.js - all the stuff related to calculating an AB
// a lot of this is (c) /u/aviator157

function getDifference(pitch, swing) {
    var max = Math.max(pitch, swing);
    var min = Math.min(pitch, swing);
    var result = Math.min(max - min, 1000 - max + min);
    return result;
}

function getResult(pitcher, pitch, batter, swing) {
    var diff = getDifference(pitch, swing);

    // 1. get batter/pitcher ranges
    // 2. combine ranges
    // 3. calculate any modifiers to ranges (TODO)
    // 4. look up diff in final range

    var batterRange = window.batterRanges[batter.types.batter];
    var pitcherRange = window.pitcherRanges[pitcher.types.pitcher];
    

    finalRange = combineRanges(batterRange, pitcherRange);
    if (pitcher.hand == batter.hand && pitcher.types.pitcher != "POS") {
        var handRange = window.handRanges[pitcher.types.bonus];
        finalRange = combineRanges(finalRange, handRange);
    }

    updateRangeTable('rangeTable_Subtotal', 'Subtotal', '', finalRange);

    // do park factor adjustment
    var currentPark = $('#parkSelect').val();
    if (currentPark != "None") {
        var factors = window.parkFactors[currentPark];
        var adjustments = doParkAdjustment(finalRange, factors.factors);
        updateRangeTable('rangeTable_Park', 'Park Factor', currentPark, adjustments)
        finalRange = combineRanges(finalRange, adjustments);
    } else {
        $('#rangeTable_Park').empty();
        $('#rangeTable_Park').append("<th scope=\"row\">Park Factor</th><th scope=\"row\"></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>")
    }

    updateRangeTable('rangeTable_Total', 'Final Range', '', finalRange);
    updateFinalTable(finalRange);

    var diffCounter = diff;
    var finalResult;
    var fields = ["HR", "3B", "2B", "1B", "BB", "FO", "K", "PO", "RGO", "LGO"];
    for (var i = 0; i < fields.length; i++) {
        var abResult = fields[i];
        diffCounter -= finalRange[abResult];
        if (diffCounter < 0) {
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

function doParkAdjustment(range, factors) {
    // step 1. do XBH adjustments
    var fields = ["HR", "3B", "2B", "BB"];
    var adjustments = {};
    fields.forEach(function(field) {
        var factor = parseFloat(factors[field]);
        var adjustment = Math.round(range[field] * factor) - range[field];
        adjustments[field] = adjustment;
    });

    // step 2. do avg adjustment
    var totalHitDiffs = range["HR"] + range["3B"] + range["2B"] + range["1B"];
    var adjustment = Math.round(totalHitDiffs * factors["AVG"]) - totalHitDiffs;
    adjustments["AVG"] = adjustment;

    // step 3. do 1B adjustment based on results from 1 and 2
    var xbhAdj = adjustments["HR"] + adjustments["3B"] + adjustments["2B"];
    var avgAdj = adjustments["AVG"];
    adjustments["1B"] = avgAdj - xbhAdj;

    // step 4. evenly distribute lost amount to out ranges
    var adjTotal = adjustments["HR"] + adjustments["3B"] + adjustments["2B"] + adjustments["1B"] + adjustments["BB"];
    var startingCount = adjTotal / 5
    if (startingCount < 0) {
        startingCount = Math.ceil(startingCount);
    } else {
        startingCount = Math.floor(startingCount);
    }
    var remainder = Math.abs(adjTotal % 5);

    var outFields = ["FO", "K", "PO", "RGO", "LGO"];
    outFields.forEach(function(field) {
        adjustments[field] = -startingCount;
        if (remainder > 0) {
            if (adjTotal < 0) {
                adjustments[field]++;
            } else {
                adjustments[field]--;
            }
            remainder--;
        }
    })
    return adjustments;
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
    // get mode
    var mode = window.calculatorMode;
    var pitch = parseInt($('#pitcherNumber').val());
    var swing = parseInt($('#batterNumber').val());

    if (mode == 'manual') {
        window.currentPitcher = {
            "hand": $('#pitcherHandManual').val(),
            "types": {
                "pitcher": $('#pitcherTypeManual').val(),
                "bonus": $('#pitcherBonusManual').val()
            }
        };
        window.currentBatter = {
            "hand": $('#batterHandManual').val(),
            "types": {
                "batter": $('#batterTypeManual').val()
            }
        };
    }

    var result = getResult(window.currentPitcher, pitch, window.currentBatter, swing);

    if (result == null) {
        $('#result').html("Methinks one of these players is missing a type or hand...");
    } else {
        $('#result').html("Swing: " + swing + "  \nPitch: " + pitch + "  \nDiff: " + result.diff + " -> " + result.result);
    }
}

// Swing: x
// Pitch: y
// Diff: z -> 3B