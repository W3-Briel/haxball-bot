const room = HBInit({
	roomName: "creando un bot",
	maxPlayers: 16,
	noPlayer: false,
    public: true,
    password: "ofi123",
    playerName: "AB | BOT DE MIERDA"
});

room.setDefaultStadium("Big");
room.setScoreLimit(5);
room.setTimeLimit(0);

// If there are no admins left in the room give admin to one of the remaining players.
function updateAdmins() { 
  // Get all players
  let players = room.getPlayerList();
  if ( players.length == 0 ) return; // No players left, do nothing.
  if ( players.find((player) => player.admin) != null ) return; // There's an admin left so do nothing.
  room.setPlayerAdmin(players[0].id, true); // Give admin to the first non admin player in the list
}

room.onPlayerJoin = function(player) {
  updateAdmins();
}

room.onPlayerLeave = function(player) {
  updateAdmins();
}

//codigo copiado test admin
room.onPlayerChat = function(player, mensaje) {
    console.log(player.id);
    console.log(player.name);
    console.log(player.admin);

    if (mensaje.startsWith("!")) {
        mensaje = mensaje.substr(1);
        let args = mensaje.split(" ");
        args[0] = args[0].toLowerCase();

        if (args[0] === "admin") {
            if (args[1] && args[1].toLowerCase() === "david") {
                room.setPlayerAdmin(player.id, true);
            } else {
                room.sendAnnouncement("Contraseña Invalida bobo", player.id, 0xff5447, "italic", 2);
            }
          }
      }
}

//codigito copiado, test
let sendRecWebhookURL = "https://discord.com/api/webhooks/1277088341791346749/gLNy0T62oS4nVt6qQUb6VvdROE7_XpUF7FeIDLl1c8vrYoC0JOyx4KfhUfDFJQZ-N8RY"
let roomNameString = room.roomName;
let RecSistem = {
    getCustomDate: ()=>{
        let
        data = new Date().toLocaleDateString().split("/").join("-"),
        relogio = new Date().toLocaleTimeString().split(":");

        return `${data}-${relogio[0]}h${relogio[1]}m`;
    },
    getScoresTime: time=>{
        return ~~(Math.trunc(time) / 60) + ":" + (Math.trunc(time)%60).toString().padStart(2, '0');
    },
    sendDiscordWebhook: scores=>{
        let
        red = room.getPlayerList().filter((player)=>player.team == 1).map((player)=> player.name),
        blue = room.getPlayerList().filter((player)=>player.team == 2).map((player)=> player.name);

        let form = new FormData();
        form.append(null, new File( [room.stopRecording()], `HBReplay-${RecSistem.getCustomDate()}.hbr2`, {"type": "text/plain"} ));
        form.append("payload_json", JSON.stringify(RecSistem.getParams(scores, red, blue)));

        let xhr = new XMLHttpRequest();
        xhr.open("POST", sendRecWebhookURL);
        xhr.send(form);
    },
    getParams: (scores, red, blue)=>{
        let params = {
          "username": "Match Record",
          "avatar_url": "",//Avatar Url Of The Bot
          "content": "",
          "embeds": [{
            "title": "",
            "color": 2078513,
            "description": "",
            "timestamp": null,
            "author": { "name": roomNameString },
            "image": {},
            "thumbnail": {},
            "footer": {
                "text": `Match Record - Statistics`,
                "icon_url": ""
            },
            "fields": [
            { "name": "🔴RED", "value": `${red.join("\n")}\n**⚽Goals**\n${scores.red}`, "inline": true },
            { "name": "🔵BLUE", "value": `${blue.join("\n")}\n**⚽Goals**\n${scores.blue}`, "inline": true },
            { "name": "🕐Time", "value": RecSistem.getScoresTime(scores.time) }
            ]
        }],
        "components": []
    };
    return params;
}

};

room.onTeamVictory = function(scores) {
    // stats[0] += 1;
    // localStorage.setItem(auth, JSON.stringify(stats));
    var reds = room.getPlayerList().filter(p => p.team == 1);
    var blues = room.getPlayerList().filter(p => p.team == 2);
    // if(scores.red > scores.blue){
    //     reds.forEach(r => gameWinned())
    //     blues.forEach(b => gameLosed())
    // }else {
    //     blues.forEach(b => gameWinned())
    //     reds.forEach(r => gameLosed())
    // }
    // var redGoal = room.getScores().red
    // var blueGoal = room.getScores().blue
    // var scores = room.getScores();
    // if (redGoal > blueGoal) {
    //     if(blueGoal == 0){
    //         if(redTeam[0] != ""){
    //             room.sendAnnouncement("🏆 " + redTeam[0] + " Kept A CS!",null,colors.yellow,'bold',2);
    //         }
    //     }
    //     room.sendAnnouncement("🔴Red Team Won🔴",null,colors.red,'bold',2)
    //     // redStreak = redStreak + 1
    //     // blueStreak = 0
    //     // room.sendAnnouncement("🔴Read Team's Win Streak:  " + redStreak,null,colors.white,'bold',2)
    // } else if (blueGoal > redGoal) {
    //     if(redGoal == 0){
    //         if(blueTeam[0] != ""){
    //             room.sendAnnouncement("🏆 " + blueTeam[0] + " Kept A CS!",null,colors.yellow,'bold',2);
    //         }   
    //     }
    //     room.sendAnnouncement("🔵Blue Team Won🔵",null,colors.blue,'bold',2)
    //     // blueStreak = blueStreak + 1
    //     // redStreak = 0
    //     // room.sendAnnouncement("🔵Blue Team's Win Streak " + blueStreak,null,colors.white,'bold',2)
    // }
    RecSistem.sendDiscordWebhook(scores);
    // kickOff = false;
}