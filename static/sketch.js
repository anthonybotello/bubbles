/*
Status: Finished basic game mechanics, playable for single person

Bugs discovered
   Minor:
    -Timer occassionally counts down into negative (unable to reproduce)

To do:
   Major:
    -Add versus mode using socket.io
    -Add high score table using MongoDB
   Minor:
    -Add start page
    -Refactor code for readability
*/

var _score = 0; //tracks the player's score
var _time = 60; //sets the time limit in seconds
var _timeOffset; //records the running time whenever the game is restarted
var _gameOver = false;
var paused = false;
var redProbability; //determines the time-dependent probability of a generated bubble being red as 1/redProbability;
var bubbles = [];
var restartArea; //dimensions of the area occupied by restart option

function setup(){
    frameRate(30); 
    let canvas = createCanvas(windowWidth/2,3*windowHeight/4);
    updateHeader(_time);
    canvas.elt.style["top"] = 0.1*height + 10 + "px";
    _timeOffset = 0;
}

function draw(){
    background("#00a18b");
    if (_gameOver){
        gameOver();
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
        _gameOver = true;
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

function gameOver(){
    noLoop();
    push();
    fill("#1a1a1a");
    textAlign(CENTER, CENTER);
    textSize(0.125*height);
    text("GAME OVER", 0.5*width, 0.35*height);
    pop();

    displayRestart(false);
}

function displayRestart(filled){
    push();
    noStroke();
    if (filled){
        fill("#ffffff");
    }
    else{
        fill("#1a1a1a");
    }
    textSize(0.07*height);
    textAlign(CENTER, CENTER);
    text("Restart", 0.5*width, 0.45*height);
    restartArea = [textWidth("Restart"), 0.07*height];
    pop();
}

function mouseClicked(){
    if (_gameOver){
        let restartWidth = restartArea[0];
        let restartHeight = restartArea[1];
        if (
            mouseX >= 0.5*(width - restartWidth) &&
            mouseX <= 0.5*(width + restartWidth) &&
            mouseY >= (0.45*height - 0.5*restartHeight) &&
            mouseY <= (0.45*height + 0.5*restartHeight)
        ){
            _gameOver = false;
            _score = 0;
            bubbles = [];
            _timeOffset = floor(millis()/1000);
            loop();
        }
    }
    else{
        if (mouseX >= 0 && mouseY >= 0){
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
                _gameOver = bubbles[index].red;
                bubbles.splice(index,1);
            }
        }
    }
}

function mouseMoved(){
    if(_gameOver){
        let restartWidth = restartArea[0];
        let restartHeight = restartArea[1];
        if (
            mouseX >= 0.5*(width - restartWidth) &&
            mouseX <= 0.5*(width + restartWidth) &&
            mouseY >= (0.45*height - 0.5*restartHeight) &&
            mouseY <= (0.45*height + 0.5*restartHeight)
        ){
            redraw();
            displayRestart(true);
        }
        else{
            redraw();
            displayRestart(false);
        }
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
    redraw();
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
        
        if (this.position.y + this.radius < 0){
            this.offScreen = true;
            bubbles = bubbles.filter((bubble) => {return !bubble.offScreen});
        }
    }
}