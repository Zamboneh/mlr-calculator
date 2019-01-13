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
    // step 1. do park factor adjustments
    var fields = ["HR", "3B", "2B", "1B", "BB"];
    var adjustments = {};
    fields.forEach(function(field) {
        var factor = parseFloat(factors[field]);
        var adjustment = Math.round(range[field] * factor) - range[field];
        adjustments[field] = adjustment;
    });

    // step 2. evenly distribute lost amount to out ranges
    var adjTotal = adjustments["HR"] + adjustments["3B"] + adjustments["2B"] + adjustments["1B"] + adjustments["BB"];
    // note: if adjTotal is negative, we need to _add_ to out ranges
    // if adjTotal is positive, we need to _subtract_ from out ranges

    // loop through out ranges and divvy up remaining points equally
    var done = false;
    var fields = ["FO", "K", "PO", "RGO", "LGO"];
    fields.forEach(function(field) {
        adjustments[field] = 0;
    });
    var counter = 0;
    var start = -adjTotal;
    while (!done) {
        var curField = fields[counter];
        counter++;
        if (counter == fields.length) {
            counter = 0;
        }

        if (range[curField] + adjustments[curField] <= 0) {
            continue;
        }

        if (start > 0) {
            start--;
            adjustments[curField]++;
        } else if (start < 0) {
            start++;
            adjustments[curField]--;
        }

        if (start == 0) {
            done = true;
        }
    }
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

function testParkFactors() {
    // catch negative ranges for given park
    // 1. get park factors
    Object.keys(window.parkFactors).forEach(function(park) {
        var chosenParkFactors = window.parkFactors[park].factors;
        console.log("Testing " + park + "...");
        Object.keys(window.batterRanges).forEach(function(batterType) {
            var batterRange = window.batterRanges[batterType];
            Object.keys(window.pitcherRanges).forEach(function(pitcherType) {
                var pitcherRange = window.pitcherRanges[pitcherType];
                // test without bonus, then test each bonus
                var combined = combineRanges(batterRange, pitcherRange);
                var combinedWithPark = combineRanges(combined, doParkAdjustment(combined, chosenParkFactors));
                var negs = checkRangeForNegative(combinedWithPark)
                if (negs.length > 0) {
                    console.log("BAD -> P " + pitcherType + " vs. B " + batterType + " -> " + negs.join());
                }
                Object.keys(window.handRanges).forEach(function(bonusType) {
                    var combinedWithHand = combineRanges(combined, window.handRanges[bonusType]);
                    var combinedWithPark = combineRanges(combined, doParkAdjustment(combined, chosenParkFactors));
                    var negs = checkRangeForNegative(combinedWithPark)
                    if (negs.length > 0) {
                        console.log("BAD -> P " + pitcherType + " vs. B " + batterType + " (bonus " + bonusType + ") -> " + negs.join());
                    }
                })
            })
        })
    })
    
}

function checkRangeForNegative(range) {
    var negatives = [];
    var fields = ["HR", "3B", "2B", "1B", "BB", "FO", "K", "PO", "RGO", "LGO"];
    fields.forEach(function(field) {
        if (range[field] < 0) {
            negatives.push(field);
        }
    })
    return negatives;
}