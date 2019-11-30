class Pipe {
    constructor(x = width) {
        this.space = 100;
        this.top = random(0, height - this.space);
        this.bottom = this.top + this.space;
        this.x = x;
        this.w = 40;
        this.speed = 5;
        this.r = random(0, 256);
        this.g = random(0, 256);
        this.b = random(0, 256);
    }

    update() {
        this.x -= this.speed;
    }

    show() {
        noStroke();
        fill(this.r, this.g, this.b);
        rect(this.x, 0, this.w, this.top);
        rect(this.x, this.bottom, this.w, height - this.bottom);
    }

    hit(bird) {
        return bird.x + bird.r >= this.x && bird.x - bird.r <= this.x + this.w && (bird.y - bird.r <= this.top || bird.y + bird.r >= this.bottom);
    }
}
