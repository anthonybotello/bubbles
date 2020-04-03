// Status: Finished basic game mechanics, playable for single person

// Bugs discovered// 
//    Major:
//      -Endgame buttons not redrawn when resizing window
//    Minor:
//      -Timer occassionally counts down into negative (unable to reproduce)
//      -Bubbles clickable while offscreen

// To do //
//    Major:
//      -Add versus mode using socket.io
//      -Add high score table using MongoDB
//    Minor:
//      -Style buttons for appearance and responsiveness
//      -Refactor code for readability

var _score = 0; //tracks the player's score
var _time = 60; //sets the time limit in seconds
var _timeOffset; //records the running time whenever the game is restarted

var paused = false;
var redProbability; //determines the time-dependent probability of a generated bubble being red as 1/redProbability;
var bubbles = [];
var gameOver = false;

function setup(){
    frameRate(30); 
    createCanvas(windowWidth/2,3*windowHeight/4);
    updateHeader(_time);
    _timeOffset = 0;
}

function draw(){
    background("#00a18b");
//End game Mechanics
////////////////////////////////////////////////////////////////////////////////////////
    if (gameOver){
        noLoop();
        push();
        stroke("#2e2e2e");
        textAlign(CENTER, CENTER);
        textSize(height/8);
        text("GAME OVER", width/2,height/3);

        restartBtn = createButton("Restart");
        restartBtn.id("restart-btn");

        // let saveScoreBtn;
        // if (updateTime() === 0){
        //     saveScoreBtn = createButton("Save Score");
        //     saveScoreBtn.id("save-score-btn");
        //     saveScoreBtn.position(width/2 - saveScoreBtn.width + 8, 0.45*height);
        //     restartBtn.position(width/2 + 8, 0.45*height);
        // }
        // else{
            restartBtn.position((width)/2 - restartBtn.width/2 + 8,0.45*height);
        // }
        pop();
        restartBtn.elt.onclick = () => {
            gameOver = false;
            _score = 0;
            bubbles = [];
            restartBtn.remove();
            // if (saveScoreBtn !== undefined){
            //     saveScoreBtn.remove();
            // }
            _timeOffset = floor(millis()/1000);
            loop();
        }
/////////////////////////////////////////////////////////////////////////////////////////
    }
    else{
        updateHeader(updateTime());
        newBubble();
        for (let bubble of bubbles){
            bubble.display();
            bubble.move();
        }
    }
}

function updateTime(){
    let t = _time + _timeOffset - floor(millis()/1000);
    redProbability = floor(t/10) + 2;
    if (t === 0){
        gameOver = true;
    }
    return t;
}

function newBubble(){
    if (bubbles.length < floor(width/8)){
        x = floor(random(width));
        y = floor(randomGaussian(height-100,height/2));
        r = floor(random(10,60));
        bubbles.push(new Bubble(x,y,r));
    }
}

function updateHeader(newTime){
    header.style["width"] = width + "px";
    header.style["height"] = 0.1*height + "px";

    score.innerHTML = "Score: " + _score;
    score.style["font-size"] = 0.05*height + "px";

    timer.innerHTML = newTime;
    timer.style["font-size"] = 0.08*height + "px";
    timer.style["left"] = (width - select("#timer").width)/2 + "px";
}

function mouseClicked(){
    let cursor = createVector(mouseX, mouseY);
    var index;
    for (let i = bubbles.length-1; i >= 0; i--){
        if (bubbles[i].position.dist(cursor) <= bubbles[i].radius){
            index = i;
            break;
        }
    }
    if (index != undefined){
        _score += bubbles[index].points;
        gameOver = bubbles[index].red;
        bubbles.splice(index,1);
    }
}

function keyPressed(){
    if (keyCode === 32){
        paused = !paused;
    } 
    if (paused) noLoop();
    else loop();
}

function windowResized(){
    resizeCanvas(windowWidth/2, 3*windowHeight/4);
}

class Bubble{
    constructor(x,y,r){
        this.oX = x; //sets the x-coordinate about which the bubble oscillates
        this.radius = r;
        this.position = createVector(x,y);
        this.amplitude = floor(random(5,20)); //sets the magnitude of the x-axis oscillation
        this.direction = random(["left","right"]); //sets the direction to start oscillating when created
        this.points = 6-floor(this.radius/10);
        this.offScreen = false;
        this.red = (floor((random(redProbability) * redProbability)/redProbability) === 0)
    }
    display(){
        push();
        if (this.red){
            this.points = 0;
            stroke("#a63737");
            fill("#e34646");
        }
        else{
            stroke("#6fad94");
            fill("#b3ffe0");
        }
        circle(this.position.x, this.position.y, 2*this.radius);

        noStroke();
        fill("#4a4e52");
        textSize(-1*(this.points - 6)*12);
        textAlign(CENTER,CENTER);
        if (!this.red){
            text(`${this.points}`, this.position.x, this.position.y);
        }
        pop();
    }
    move(){
        switch (this.direction){
            case "left":
                this.position.x--;
                if (this.position.x === this.oX - this.amplitude)
                    this.direction = "right";
                break;
            case "right":
                this.position.x++;
                if (this.position.x === this.oX + this.amplitude)
                    this.direction = "left";
                break;
        }
        this.position.y--;
        
        if (this.position.y + this.radius < 0.1*height){
            this.offScreen = true;
            bubbles = bubbles.filter((bubble) => {return !bubble.offScreen});
        }
    }
}