// handlers.js - all the jquery stuff that should run to set up the UI and stuff

window.infieldInRange = {
    'HR': '',
    '3B': '',
    '2B': '',
    '1B': 6,
    'BB': '',
    'FO': '',
    'K': '',
    'PO': '',
    'LGO': -3,
    'RGO': -3
}
window.zeroedRange = {
    "HR": 0,
    "3B": 0,
    "2B": 0,
    "1B": 0,
    "BB": 0,
    "FO": 0,
    "K": 0,
    "PO": 0,
    "RGO": 0,
    "LGO": 0
}
window.blankRange = {
    "HR": '',
    "3B": '',
    "2B": '',
    "1B": '',
    "BB": '',
    "FO": '',
    "K": '',
    "PO": '',
    "RGO": '',
    "LGO": ''
}

// number validation
function checkInputs() {
    var pitch = parseInt($('#pitcherNumber').val());
    var swing = parseInt($('#batterNumber').val());

    if (!isNaN(pitch) && (pitch > 0 && pitch < 1001)) {
        $('#pitcherInfo').removeClass('has-error');
    } else {
        $('#pitcherInfo').addClass('has-error');
    }

    if (!isNaN(swing) && (swing > 0 && swing < 1001)) {
        $('#batterInfo').removeClass('has-error');
    } else {
        $('#batterInfo').addClass('has-error');
    }

    if ($('#batterInfo').hasClass('has-error') || $('#pitcherInfo').hasClass('has-error')) {
        $('#calcButton').addClass('disabled');
    } else {
        $('#calcButton').removeClass('disabled');
    }
}

$(function(){$('#batterNumber').keyup(checkInputs)});
$(function(){$('#pitcherNumber').keyup(checkInputs)});


// player autocomplete
$(function(){
    $('#pitcherText').keyup(function(){
        $('#pitcherListItems').css('display', '');
        var current_query = $('#pitcherText').val().toLowerCase();
        if (current_query !== "") {
            $("#pitcherListItems li").hide();
            $("#pitcherListItems li").each(function(){
                var current_keyword = $(this).text().toLowerCase();
                if (current_keyword.includes(current_query)) {
                    $(this).show();
                }
            })
        } else {
            $("#pitcherListItems li").hide();
        }
    })
});
$(function(){
    $('#batterText').keyup(function(){
        $('#batterListItems').css('display', '');
        var current_query = $('#batterText').val().toLowerCase();
        if (current_query !== "") {
            $("#batterListItems li").hide();
            $("#batterListItems li").each(function(){
                var current_keyword = $(this).text().toLowerCase();
                if (current_keyword.includes(current_query)) {
                    $(this).show();
                }
            })
        } else {
            $("#batterListItems li").hide();
        }
    })
});

$('#pitcherListItems').click(function(e) {
    if (e.target && e.target.nodeName == "LI") {
        var pitcherText = e.target.textContent;
        pitcherText = pitcherText.slice(0, pitcherText.length - 3);
        $('#pitcherText').val(pitcherText);
        $('#pitcherListItems').css('display', 'none');

        // badges
        var pitcherName = $('#pitcherText').val();
        
        var pitcher;
        for (var i = 0; i < window.allPlayers.length; i++) {
            if (pitcherName == window.allPlayers[i].fullDisplayTitle) {
                pitcher = window.allPlayers[i];
                break;
            }
        }
        if (!pitcher) {
            return;
        }
        window.currentPitcher = pitcher;

        pitcherType = pitcher.types.pitcher;
        $('#pitcherTypeBadge').html(window.pitcherRanges[pitcherType].fullName);
        $('#pitcherHandBadge').html(pitcher.hand);
        updateRangeTable('rangeTable_Pitcher', 'Pitcher Range', window.pitcherRanges[pitcherType].fullName, window.pitcherRanges[pitcherType]);
        updateHandTable()
    }
});
$('#batterListItems').click(function(e) {
    if (e.target && e.target.nodeName == "LI") {
        var batterText = e.target.textContent;
        batterText = batterText.slice(0, batterText.length - 3);
        $('#batterText').val(batterText);
        $('#batterListItems').css('display', 'none');

        // badges
        var batterName = $('#batterText').val();
        
        var batter;
        for (var i = 0; i < window.allPlayers.length; i++) {
            if (batterName == window.allPlayers[i].fullDisplayTitle) {
                batter = window.allPlayers[i];
                break;
            }
        }
        if (!batter) {
            return;
        }
        window.currentBatter = batter;
        
        batterType = batter.types.batter;
        $('#batterTypeBadge').html(window.batterRanges[batterType].fullName);
        $('#batterHandBadge').html(batter.hand);
        updateRangeTable('rangeTable_Batter', 'Batter Range', window.batterRanges[batterType].fullName, window.batterRanges[batterType]);
        updateHandTable()
    }
});

$('#lookupButton').click(function() {
    window.calculatorMode = 'lookup';
    $('#manualButton').removeClass("active");
    $('#lookupButton').addClass("active");
    $('#pitcherTextInput').css('display', '');
    $('#pitcherTextManual').css('display', 'none');
    $('#batterTextInput').css('display', '');
    $('#batterTextManual').css('display', 'none');
    $('#pitcherTypeBadge').css('display', '');
    $('#pitcherHandBadge').css('display', '');
    $('#batterTypeBadge').css('display', '');
    $('#batterHandBadge').css('display', '');
})
$('#manualButton').click(function() {
    window.calculatorMode = 'manual';
    $('#manualButton').addClass("active");
    $('#lookupButton').removeClass("active");
    $('#pitcherTextInput').css('display', 'none');
    $('#pitcherTextManual').css('display', '');
    $('#batterTextInput').css('display', 'none');
    $('#batterTextManual').css('display', '');
    $('#pitcherTypeBadge').css('display', 'none');
    $('#pitcherHandBadge').css('display', 'none');
    $('#batterTypeBadge').css('display', 'none');
    $('#batterHandBadge').css('display', 'none');
})

$('#pitcherTypeManual').change(function() {
    var type = $('#pitcherTypeManual').val();
    updateRangeTable('rangeTable_Pitcher', 'Pitcher Range', window.pitcherRanges[type].fullName, window.pitcherRanges[type])
})
$('#batterTypeManual').change(function() {
    var type = $('#batterTypeManual').val();
    updateRangeTable('rangeTable_Batter', 'Batter Range', window.batterRanges[type].fullName, window.batterRanges[type])
})
$('#pitcherHandManual').change(handOrBonusChanged)
$('#batterHandManual').change(handOrBonusChanged)
$('#pitcherBonusManual').change(handOrBonusChanged)

function handOrBonusChanged() {
    var batterHand = $('#batterHandManual').val()
    var pitcherHand = $('#pitcherHandManual').val()
    var bonus = $('#pitcherBonusManual').val()
    if ((batterHand == pitcherHand) && ($('#pitcherTypeManual').val() != "POS")) {
        // apply bonus
        var handRange = window.handRanges[bonus];
        updateRangeTable('rangeTable_Hand', 'Hand Bonus', handRange.fullName, handRange);
    } else {
        updateRangeTable('rangeTable_Hand', 'Hand Bonus', 'None', window.zeroedRange);
    }
}

$('#infieldInCheck').change(function() {
    if (this.checked) {
        updateRangeTable('rangeTable_Infield', 'Infield In', 'Yes', window.infieldInRange);
    } else {
        updateRangeTable('rangeTable_Infield', 'Infield In', 'No', window.blankRange);
    }
})

$('#copyButton').click(function() {
    $('#result').select();
    document.execCommand('copy');
    $('#resultMessage').html("Result copied to clipboard!");
})

function updateHandTable() {
    if (!window.currentBatter || !window.currentPitcher) {
        return
    }

    if (window.currentBatter.hand == window.currentPitcher.hand && window.currentPitcher.types.pitcher != "POS") {
        var handRange = window.handRanges[window.currentPitcher.types.bonus];
        updateRangeTable('rangeTable_Hand', 'Hand Bonus', handRange.fullName, handRange);
    } else {
        updateRangeTable('rangeTable_Hand', 'Hand Bonus', 'None', window.zeroedRange);
    }
}

function updateRangeTable(rowId, type, title, range) {
    var tableRow = $('#' + rowId);
    tableRow.empty();
    tableRow.append("<th scope=\"row\">" + type + "</th>")
    tableRow.append("<th scope=\"row\">" + title + "</th>");
    var fields = ["HR", "3B", "2B", "1B", "BB", "FO", "K", "PO", "RGO", "LGO"];
    fields.forEach(function(field) {
        tableRow.append("<td>" + range[field] + "</td>");
    });
}

function updateFinalTable(range) {
    var tableRow = $('#rangeTable_TotalExpanded');
    tableRow.empty();
    tableRow.append("<th scope=\"row\">Expanded</th>")
    tableRow.append("<th scope=\"row\"></th>");
    var counter = 0;
    var fields = ["HR", "3B", "2B", "1B", "BB", "FO", "K", "PO", "RGO", "LGO"];
    fields.forEach(function(field) {
        var start = counter;
        counter += range[field];
        var end = counter - 1;
        tableRow.append("<td>" + start + " - " + end + "</td>")
    })
}