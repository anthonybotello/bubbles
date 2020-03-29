let bubbles = [];
let paused = false;
var score = 0;

function setup(){
    frameRate(30);
    var canvas = createCanvas(windowWidth-17,windowHeight-17);
    canvas.style("display","block");
}

function draw(){
    background("#00a18b");

    if (bubbles.length < floor(width/8)){
        x = floor(random(width));
        y = floor(randomGaussian(height-100,height/2));
        r = floor(random(10,60));
        bubbles.push(new Bubble(x,y,r));
    }
    for (let bubble of bubbles){
        bubble.display();
        bubble.move();
    }

    push();
    noStroke();
    fill("#f5fc65");
    textSize(20);
    text("Score:", 25, 26);
    textSize(30);
    text(`${score}`, 85, 30);
    pop();

    // //add timer
    // textSize(width/20);
    // textAlign(CENTER,TOP);
    // text(`${second()}`, width/2, 20);
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
        let red = bubbles[index].red;
        let points = bubbles[index].points;
        bubbles.splice(index,1);
        if (red){
            alert("GAME OVER!");
            score = 0;
            bubbles = [];
        }
        else score += points;
    }
}

function keyPressed(){ 
    if (keyCode === 32){
        pause = !pause;
        if (pause) noLoop();
        else loop();
    }
}

function windowResized(){
    resizeCanvas(windowWidth-17, windowHeight-17);
    background(128);
}

function offScreen(bubble){
    return !bubble.offScreen;
}

class Bubble{
    constructor(x,y,r){
        this.oX = x;
        this.radius = r;
        this.position = createVector(x,y);
        this.amplitude = floor(random(5,20));
        this.direction = random(["left","right"]);
        this.red = random([true,false,false,false,false,false,false]);
        this.points = 6-floor(this.radius/10);
        this.offScreen = false;
    }
    display(){
        push();
        if (this.red){
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
            bubbles = bubbles.filter(offScreen);
        }
    }
}
