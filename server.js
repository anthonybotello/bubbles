const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const GameState = require('./gameObjects').GameState;

app.use(express.static(__dirname + '/static'));

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/static/bubbles.html');
});

app.get('/vs', (req, res) => {
    res.sendFile(__dirname + '/static/bubblesVs.html');
});

const vs = io.of('/vs');
const rooms = vs.adapter.rooms;
const games = {};

function createUpdate(gameState){
    gameState.updateState();
    let state = {
        time: gameState.time,
        scores: gameState.scores,
        bubbles: gameState.bubbles,
        gameOver: gameState.gameOver,
        poppedRed: gameState.poppedRed
    }
    return state;
}

vs.on('connection', (socket) => {
    socket.leave(socket.id);
    let room;
    for (let r in rooms){
        if (rooms[r].length < 2){
            room = r;
            break;
        }
    }
    if (room === undefined){
        room = 'room ' + Math.ceil(vs.server.engine.clientsCount/2);;
    }
    socket.join(room, () => {
        socket.gameRoom = room;
        if (rooms[room].length == 2){
            let scores = {};
            for (let id in rooms[room].sockets){
                vs.in(room).emit('ready', id);
                scores[id] = 0;
            }
            games[room] = new GameState();
            games[room].scores = scores;
        }
    });

    socket.on('disconnect', () => {
        delete games[socket.gameRoom];
        socket.in(socket.gameRoom).broadcast.emit('opponent disconnect');
    });

    socket.on('update', () => {
        if(games[socket.gameRoom]){
            let gameState = games[socket.gameRoom];
            gameState.updateTimeElapsed();
            if (gameState.updateCountdown() > 0){
                vs.in(socket.gameRoom).emit('countdown', gameState.updateCountdown());
            }
            else{
                vs.in(socket.gameRoom).emit('countdown', 0);
                vs.in(socket.gameRoom).emit('update', createUpdate(gameState));
            }
        }
    });

    socket.on('popped', (index) => {
        let gameState = games[socket.gameRoom];
        gameState.scores[socket.id] += gameState.bubbles[index].points;
        gameState.gameOver = gameState.bubbles[index].isRed;
        gameState.bubbles.splice(index, 1);
        if (gameState.gameOver){
            gameState.poppedRed = socket.id;
        }
        vs.in(socket.gameRoom).emit('update', createUpdate(gameState));
    });

    socket.on('restart', () => {
        let gameState = new GameState();
        let scores = games[socket.gameRoom].scores;
        for (let score in scores){
            scores[score] = 0;
        }
        gameState.scores = scores;
        games[socket.gameRoom] = gameState;
        vs.in(socket.gameRoom).emit('update', gameState);
    });
});

server.listen(5000);