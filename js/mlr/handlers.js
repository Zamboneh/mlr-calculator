// handlers.js - all the jquery stuff that should run to set up the UI and stuff

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
    }
});