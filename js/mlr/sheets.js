var API_KEY = "AIzaSyBwqi6e_o1xg7pnJjyG3pnUa9MsWEXksgQ";
var BASE_ROSTER_URL = "https://sheets.googleapis.com/v4/spreadsheets/1JxXUlVbF_c72OA_f9wdykNNkJ0k4Z49vsUl8J-qNzJA/values:batchGet?"

// data we need:
// - batter ranges table - Tables!Z2:AK14
// - pitcher ranges table - Tables!Z17:AK29
// - hand ranges table - Tables!Z32:AK34
// - all team tables - <team>!A3:AM23

function buildSheetsURL() {
    var requestString = BASE_ROSTER_URL + "ranges=Tables!Z2:AK14&";
    requestString += "ranges=Tables!Z17:AK29&";
    requestString += "ranges=Tables!Z32:AK34&";

    // var teamList = ["ARI", "BOS", "CLE", "CHC", "COL", "DET",
    //                 "HOU", "KCR", "LAA", "LAD", "MIA", "MIL",
    //                 "MTL", "NYM", "NYY", "OAK", "PHI", "PIT",
    //                 "SDP", "SFG", "STL", "TBD", "TOR", "TEX"];
    var teamList = ["HOU"];
    for (var i = 0; i < teamList.length; i++) {
        requestString += "ranges=" + teamList[i] + "!A3:AO23&";
    }
    requestString += buildKey();
    return requestString;
}

function buildKey() {
    return "key=" + API_KEY;
}

function getData() {
    $.ajax({
        url: buildSheetsURL()
    }).done(parseData);
}

function parseData() {
    // data is passed as args

    window.batterRanges = buildRanges(arguments[0].valueRanges[0].values);
    window.pitcherRanges = buildRanges(arguments[0].valueRanges[1].values);
    window.handRanges = buildRanges(arguments[0].valueRanges[2].values);

    window.allPlayers = [];
    // parse players
    for (var i = 3; i < arguments[0].valueRanges.length; i++) {
        // get team roster
        var teamRange = arguments[0].valueRanges[i];
        var team = teamRange.range.substring(0, teamRange.range.indexOf('!'))
        var roster = teamRange.values;
        for (var j = 0; j < roster.length; j++) {
            var playerRow = roster[j];
            var playerObj = {
                name: playerRow[3],
                team: team,
                reddit: playerRow[4],
                discord: playerRow[5],
                types: {
                    batter: playerRow[6],
                    pitcher: playerRow[7],
                    bonus: playerRow[8],
                },
                hand: playerRow[9],
                fullDisplayTitle: buildPlayerTitle(playerRow)
            };
            window.allPlayers.push(playerObj);
        }
    }

    window.allPlayers.forEach(function(player) {
        $('#pitcherListItems').append('<li class="list-group-item">' + player.fullDisplayTitle + '<span class="badge badge-light">' + player.team + '</span></li>');
        $('#batterListItems').append('<li class="list-group-item">' + player.fullDisplayTitle + '<span class="badge badge-light">' + player.team + '</span></li>');
    });

    $(".loadingContainer").css("display", "none");
}

function buildRanges(rangeRows) {
    var result = {};
    for (var i = 0; i < rangeRows.length; i++) {
        var typeRow = rangeRows[i];
        result[typeRow[0]] = {
            fullName: typeRow[1],
            HR: typeRow[2],
            "3B": typeRow[3],
            "2B": typeRow[4],
            "1B": typeRow[5],
            BB: typeRow[6],
            FO: typeRow[7],
            K: typeRow[8],
            PO: typeRow[9],
            RGO: typeRow[10],
            LGO: typeRow[11]
        }
    }
    return result;
}

function buildPlayerTitle(playerRow) {
    var title = playerRow[3].trim();
    if (typeof(playerRow[4]) != "undefined") {
        title += " (" + playerRow[4].trim() + ")";
    }
    if (typeof(playerRow[5]) != "undefined") {
        title += " (" + playerRow[5].trim() + ")";
    }
    return title;
}