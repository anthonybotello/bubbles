class GameState{
    constructor(){
        this.initTime = Date.now();
        this.countdown = 5000;
        this.time = 65000;
        this.timeElapsed = 0;
        this.scores = {};
        this.bubbles = [];
        this.gameOver = false;
        this.poppedRed;
    }
    updateState(){
        this.time = 65000 - this.timeElapsed;

        if (this.time <= 0){
            this.gameOver = true;
        }

        let offScreen = false;
        for (let bubble of this.bubbles){
            bubble.move();
            if (bubble.y + bubble.r < 0){
                offScreen = true;
            }
        }
        if (offScreen){
            this.bubbles = this.bubbles.filter((bubble) => {return bubble.y + bubble.r >= 0});
        }

        if (this.bubbles.length < 50){
            let isRed = Math.random() < (1 + Math.floor(this.timeElapsed/20000))/12;
            this.bubbles.push(new Bubble(isRed));
        }
    }
    updateTimeElapsed(){
        this.timeElapsed = Date.now() - this.initTime;
    }
    updateCountdown(){
        if (this.countdown > 0){
            this.countdown = 5000 - this.timeElapsed;
        }
        return this.countdown;
    }
}

class Bubble{
    constructor(isRed){
        this.x = Math.floor(Math.random() * 501);
        this.y = Math.floor(Math.random() * 501);
        this.r = Math.floor(Math.random() * 50) + 10;

        this.oX = this.x;
        this.amplitude = Math.floor(Math.random() * 16) + 5;
        this.direction = Math.floor(Math.random() * 2) === 0 ? "left" : "right";
        
        this.points = isRed ? 0 : 6 - Math.floor(this.r/10);
        this.isRed = isRed;
    }
    move(){
        switch (this.direction){
            case "left":
                this.x--;
                if (this.x === this.oX - this.amplitude)
                    this.direction = "right";
                break;
            case "right":
                this.x++;
                if (this.x === this.oX + this.amplitude)
                    this.direction = "left";
                break;
        }
        this.y--;
    }
}

module.exports = {GameState, Bubble}