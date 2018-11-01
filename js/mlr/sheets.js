var API_KEY = "AIzaSyBwqi6e_o1xg7pnJjyG3pnUa9MsWEXksgQ";
var BASE_ROSTER_URL = "https://sheets.googleapis.com/v4/spreadsheets/1JxXUlVbF_c72OA_f9wdykNNkJ0k4Z49vsUl8J-qNzJA/values:batchGet?"

window.teamNames = {
    "Arizona Diamondbacks": "ARI",
    "Boston Red Sox": "BOS",
    "Cleveland Indians": "CLE",
    "Chicago Cubs": "CHC",
    "Colorado Rockies": "COL",
    "Detroit Tigers": "DET",
    "Houston Astros": "HOU",
    "Kansas City Royals": "KCR",
    "Los Angeles Angels": "LAA",
    "Los Angeles Dodgers": "LAD",
    "Miami Marlins": "MIA",
    "Milwaukee Brewers": "MIL",
    "Montreal Expos": "MTL",
    "New York Mets": "NYM",
    "New York Yankees": "NYY",
    "Oakland Athletics": "OAK",
    "Philadelphia Phillies": "PHI",
    "Pittsburgh Pirates": "PIT",
    "San Diego Padres": "SDP",
    "San Francisco Giants": "SFG",
    "St. Louis Cardinals": "STL",
    "Tampa Bay Devil Rays": "TBD",
    "Toronto Blue Jays": "TOR",
    "Texas Rangers": "TEX"
}

// data we need:
// - batter ranges table - Tables!AD2:AO14
// - pitcher ranges table - Tables!AD17:AO30
// - hand ranges table - Tables!AD33:AO35
// - park factor table - MLR Parks!A4:G8 - subject to expansion
// - all team tables - <team>!A3:AM23

function buildSheetsURL() {
    var requestString = BASE_ROSTER_URL + "ranges=Tables!AG2:AR14&";
    requestString += "ranges=Tables!AG17:AR30&";
    requestString += "ranges=Tables!AG33:AR35&";
    requestString += "ranges='MLR Parks'!A4:G50&";

    var teamList = ["ARI", "BOS", "CLE", "CHC", "COL", "DET",
                    "HOU", "KCR", "LAA", "LAD", "MIA", "MIL",
                    "MTL", "NYM", "NYY", "OAK", "PHI", "PIT",
                    "SDP", "SFG", "STL", "TBD", "TOR", "TEX"];
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
    Object.keys(window.batterRanges).forEach(function(rangeAbbr) {
        var batterRange = window.batterRanges[rangeAbbr];
        $('#batterTypeManual').append('<option value="' + rangeAbbr + '">' + batterRange.fullName + '</option>')
    })
    window.pitcherRanges = buildRanges(arguments[0].valueRanges[1].values);
    Object.keys(window.pitcherRanges).forEach(function(rangeAbbr) {
        var pitcherRange = window.pitcherRanges[rangeAbbr];
        $('#pitcherTypeManual').append('<option value="' + rangeAbbr + '">' + pitcherRange.fullName + '</option>')
    })
    window.handRanges = buildRanges(arguments[0].valueRanges[2].values);
    Object.keys(window.handRanges).forEach(function(rangeAbbr) {
        var handRange = window.handRanges[rangeAbbr];
        $('#pitcherBonusManual').append('<option value="' + rangeAbbr + '">' + handRange.fullName + '</option>')
    })
    window.parkFactors = buildParkFactors(arguments[0].valueRanges[3].values);

    window.allPlayers = [];
    // parse players
    for (var i = 4; i < arguments[0].valueRanges.length; i++) {
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
                    pitcher: function(){ if (playerRow[7] != "") { return playerRow[7] } else { return "POS" }}(),
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

function buildParkFactors(rangeRows) {
    var result = {};
    for (var i = 0; i < rangeRows.length; i++) {
        var parkRow = rangeRows[i];
        // get team name
        var parkTeamAbbr = window.teamNames[parkRow[0]];
        if (typeof(parkTeamAbbr) == "undefined") {
            parkTeamAbbr = "N/A";
        }
        park = {
            name: parkRow[1],
            team: parkTeamAbbr,
            factors: {
                AVG: parkRow[2],
                BB: parkRow[3],
                "2B": parkRow[4],
                "3B": parkRow[5],
                HR: parkRow[6]
            }
        }
        result[park.name] = park;
        //$('#parkSelect').append("<option value=\"" + park.name + "\">(" + park.team + ") " + park.name + "</option>");
    }
    var parkNames = Object.keys(result);
    parkNames.sort(function(a, b) {
        var teamA = result[a].team;
        var teamB = result[b].team;
        if (teamA == "N/A" && teamB != "N/A") {
            return 1;
        } else if (teamB == "N/A" && teamA != "N/A") {
            return -1;
        } else if (teamA == "N/A") {
            // both a and b are N/A so compare park names directly
            return parkSort(a, b);
        }
        return parkSort(teamA, teamB);
    });
    parkNames.forEach(function(parkName) {
        $('#parkSelect').append("<option value=\"" + parkName + "\">(" + result[parkName].team + ") " + parkName + "</option>");
    })
    return result;
}

function parkSort(a, b) {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    }
    return 0;
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