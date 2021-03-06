let restartArea;
let restartHighlight;
let time = 60;
let countdown = 5;
let scores = {};
let bubbles = [];
let gameOver = false;
let poppedRed;
let opponentID;
let canvas;
let mode;
let start = false;

let socket;

function setup(){
    canvas = createCanvas(500,500);
    canvas.elt.style["top"] = "65px";
    canvas.elt.style["left"] = 0.5*windowWidth - 250 + "px";

    if (location.href.substr(-2) === 'vs'){
        mode = 'vs';
        modeSelect.href = "../";
        modeSelect.innerHTML = "Single Player";
        socket = io('/vs');
        socket.on('ready', (oppID) => {
            if (oppID !== socket.id){
                opponentID = oppID;
            }
        });
        socket.on('opponent disconnect', () => {
            opponentID = undefined;
        });
    }
    else{
        mode = 'single';
        modeSelect.href = "vs";
        modeSelect.innerHTML = "VS Mode";
        socket = io('/single');
        opponentID = "n/a";
        canvas.elt.onclick = () => {
            start = true;
        }
    }

    socket.on('countdown', (count) => {
        countdown = ceil(count/1000);
    });
    socket.on('update', (gameState) => {
        time = ceil(gameState.time/1000);
        scores = gameState.scores;
        bubbles = gameState.bubbles;
        gameOver = gameState.gameOver;
        poppedRed = gameState.poppedRed;
    });

    frameRate(24);
    updateHeader(time);
    header.style["left"] = 0.5*windowWidth - 250 + "px";
}

function draw(){
    background("#00a18b");
    updateHeader(time);
    if (mode === 'vs' && !opponentID){
        waiting();
    }
    else if (mode ==='single' && !start){
        startScreen();
    }
    else if (gameOver){
        endGame();
    }
    else{
        socket.emit('update');
        if (countdown <= 0){
            displayBubbles();
        }
        else{
            updateCountdown();
        }
    }
}

function startScreen(){
    push();
    fill("#1a1a1a");
    textSize(30);
    textAlign(CENTER, CENTER);
    text("Click to start", 250, 150);
    pop();
}

function waiting(){
    let waitMsg = "Waiting for opponent";
    for (let i = 0; i < second() % 4; i++){
        waitMsg += ".";
    }
    push();
    fill("#1a1a1a");
    textSize(30);
    textAlign(LEFT, CENTER);
    text(waitMsg, 95, 150);
    pop();
}

function updateCountdown(){
    push();
    fill("#1a1a1a");
    textSize(40);
    textAlign(CENTER, CENTER);
    text("Game starting in", 250,100);
    textSize(180);
    text(countdown, 250, 220);
    pop();
}

function displayBubbles(){
    for (let bubble of bubbles){
        push();
        if (bubble.isRed){
            stroke("#a63737");
            fill("#e34646");
        }
        else{
            stroke("#6fad94");
            fill("#b3ffe0");
        }
        circle(bubble.x, bubble.y, 2*bubble.r);

        noStroke();
        fill("#4a4e52");
        textSize(-1*(bubble.points - 6)*12);
        textAlign(CENTER,CENTER);
        if (!bubble.isRed){
            text(`${bubble.points}`, bubble.x, bubble.y);
        }
        pop();
    }
}

function updateHeader(newTime){
    header.style["width"] = width + "px";
    header.style["height"] = 0.1*height + "px";

    let p1Score;
    let p2Score;
    if (mode === 'vs'){
        if (scores[opponentID] === undefined){
            p1Score = 0;
            p2Score = 0;
        }
        else{
            p1Score = scores[socket.id];
            p2Score = scores[opponentID];
        }
    }
    else{
        if (scores[socket.id] === undefined){
            p1Score = 0;
        }
        else{
            p1Score = scores[socket.id];
        }
    }
    p1.innerHTML = "You: " + p1Score;
    p1.style["font-size"] = 0.05*height + "px";
    p2.innerHTML = "Opponent: " + p2Score;
    p2.style["font-size"] = 0.05*height + "px";

    if(mode === 'single'){
        p1.innerHTML = "Score: " + p1Score;
        p2.style["display"] = "none";
    }

    if (newTime > 60){
        timer.innerHTML = 60;
    }
    else{
        timer.innerHTML = newTime;
    }
    timer.style["font-size"] = 0.08*height + "px";
    timer.style["left"] = (width - select("#timer").width)/2 + "px";
}

function endGame(){
    let result;
    if (mode === 'vs'){
        if (poppedRed === opponentID){
            result = "You win!";
        }
        else if (poppedRed === socket.id){
            result = "You lose!";
        }
        else{
            if (poppedRed === socket.id || scores[socket.id] < scores[opponentID]){
                result = "You lose!";
            }
            else if (poppedRed === opponentID || scores[socket.id] > scores[opponentID]){
                result = "You win!";
            }
            else{
                result = "It's a draw!";
            }
        }
    }
    else{
        if (poppedRed){
            result = "You lose!";
        }
        else{
            result = "Score: " + scores[socket.id];
        }
    }
    push();
    fill("#1a1a1a");
    textAlign(CENTER, CENTER);
    textSize(0.125*height);
    text(result, 0.5*width, 0.35*height);
    pop();
    displayRestart(restartHighlight);
}

function displayRestart(hover){
    push();
    if (hover){
        fill("#ffffff");
    }
    else{
        fill("#1a1a1a");
    }
    textSize(0.07*height);
    textAlign(CENTER, CENTER);
    text("Restart", 0.5*width, 0.45*height);
    pop();
    restartArea = [textWidth("Restart"), 0.07*height];
}

function mouseClicked(){
    if (gameOver){
        let restartWidth = restartArea[0];
        let restartHeight = restartArea[1];
        if (
            mouseX >= 0.5*(width - restartWidth) &&
            mouseX <= 0.5*(width + restartWidth) &&
            mouseY >= (0.45*height - 0.5*restartHeight) &&
            mouseY <= (0.45*height + 0.5*restartHeight)
        ){
            socket.emit('restart');
        }
    }
    else{
        if (mouseX >= 0 && mouseY >= 0){
            let cursor = createVector(mouseX, mouseY);
            for (let i = bubbles.length-1; i >= 0; i--){
                if (cursor.dist(new p5.Vector(bubbles[i].x, bubbles[i].y)) <= bubbles[i].r){
                    socket.emit('popped', i);
                    break;
                }
            }
        }
    }
}

function mouseMoved(){
    if(gameOver){
        let restartWidth = restartArea[0];
        let restartHeight = restartArea[1];
        if (
            mouseX >= 0.5*(width - restartWidth) &&
            mouseX <= 0.5*(width + restartWidth) &&
            mouseY >= (0.45*height - 0.5*restartHeight) &&
            mouseY <= (0.45*height + 0.5*restartHeight)
        ){
            restartHighlight = true;
        }
        else{
            restartHighlight = false;
        }
    }
}

function windowResized(){
    canvas.elt.style["left"] = 0.5*windowWidth - 250 + "px";
    header.style["left"] = 0.5*windowWidth - 250 + "px";
    redraw();
}