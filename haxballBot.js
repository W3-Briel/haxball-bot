const room = HBInit({
	roomName: "creando un bot",
	maxPlayers: 16,
	noPlayer: false,
    public: true,
    password: "ofi123",
    playerName: "AB | BOT DE MIERDA"
});

room.setDefaultStadium("Small");
room.setScoreLimit(3);
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

    //remplazar esta estructura por un switch
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

// asist y goleador
let lastkicker;
let lastkicker2;

let partidoAsist;
let partidoGol;
let partidoGolEncontra;

room.onGameStart = function(byPlayer){
    lastkicker2 = {
        name: "",
        team: undefined
    };
    lastkicker = {
        name: "",
        team: undefined
    };

    partidoAsist = [];
    partidoGol = [];
    partidoGolEncontra = [];

}

room.onPlayerBallKick = function(player){
    if(lastkicker.name == player.name){
        lastkicker2.name = "";

        lastkicker = {
            name: player.name,
            team: room.getPlayerList().filter( l => l.name == player.name)[0].team
        }

    } else {
        lastkicker2 = lastkicker;
        
        lastkicker = {
            name: player.name,
            team: room.getPlayerList().filter( l => l.name == player.name)[0].team
        };
    }
}

room.onTeamGoal = function(team) {
    const festejos = [
        "¡Qué golazo de " + lastkicker.name + "!",
        "¡" + lastkicker.name + " está imparable!",
        "¡" + lastkicker.name + " lo hizo de nuevo!",
        "¡Golazo de " + lastkicker.name + "! ¡El proximo maradona!",
        "¡Golazo de el goat " + lastkicker.name,
        "¡" + lastkicker.name + " deja un poco para los demas!"
    ];
    
    const mensajeAleatorio = festejos[Math.floor(Math.random() * festejos.length)];
    
    if (lastkicker.team != team){ // gol encontra

        partidoGolEncontra.push(lastkicker.name)
        room.sendAnnouncement("este "+ lastkicker.name +" es un boludo", null, 0xffff82, "italic", 0);
    }else{
        if (lastkicker2.name === "") {
            
            partidoGol.push(lastkicker.name)
            room.sendAnnouncement(mensajeAleatorio, null, 0xffff82, "italic", 0);
        } else {
            partidoGol.push(lastkicker.name)
            partidoAsist.push(lastkicker2.name)
            
            room.sendAnnouncement(mensajeAleatorio + ", Asistencia de " + lastkicker2.name, null, 0xffff82, "italic", 0);
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
    sendDiscordWebhook: (scores, pGol,pGolEncontra,pAsist)=>{
        let red = room.getPlayerList().filter((player)=>player.team == 1).map((player)=> {
            let name = player.name;
            pGol.forEach(p => {
                if (player.name == p){
                    name+= " ⚽"
                }
            });

            pGolEncontra.forEach(p => {
                if (player.name == p){
                    name+= " 🤡"
                }
            });

            pAsist.forEach(p => {
                if (player.name == p){
                    name+= " 👟"
                }
            });

            return name;
        })

        let blue = room.getPlayerList().filter((player)=>player.team == 2).map((player)=> {
            let name = player.name;
            pGol.forEach(p => {
                if (player.name == p){
                    name+= " ⚽"
                }
            });

            pGolEncontra.forEach(p => {
                if (player.name == p){
                    name+= " 🤡"
                }
            });

            pAsist.forEach(p => {
                if (player.name == p){
                    name+= " 👟"
                }
            });

            return name;
        });

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
    RecSistem.sendDiscordWebhook(scores,partidoGol,partidoGolEncontra,partidoAsist);
}