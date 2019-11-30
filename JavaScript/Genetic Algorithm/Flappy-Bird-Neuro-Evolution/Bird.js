class Bird {
    constructor(brain) {
        this.y = height / 2;
        this.x = 130;
        this.g = 0.5;
        this.lift = -12;
        this.v = 0;
        this.r = 12;
        this.points = 0;
        if (brain) {
            this.brn = brain;
        } else {
            this.brn = new NN(5, 10, 2);
        }
    }

    closestPipe() {
        let closestD = Infinity;
        let closestP = pipes[0];

        for (let p of pipes) {
            const d = (p.x + p.w) - this.x;
            if (d <= closestD && d >= 0) {
                closestD = d;
                closestP = p;
            }
        }
        return closestP;
    }

    fittest() {
        this.brn.show();
        stroke(255);
        strokeWeight(0.5);
        fill(150, 20, 220);
        circle(this.x, this.y, 2 * this.r);
    }

    show() {
        stroke(255);
        strokeWeight(0.5);
        fill(200, 20, 100, 200);
        circle(this.x, this.y, 2 * this.r);
    }

    up() {
        this.v += this.lift;
    }

    update() {
        this.points++;
        this.v += this.g;
        this.v *= 0.95;
        this.y += this.v;

        if (this.y >= height - this.r) {
            this.y = height - this.r;
            this.v = 0;
        }

        if (this.y <= 0) {
            this.y = this.r;
        }
    }
}
