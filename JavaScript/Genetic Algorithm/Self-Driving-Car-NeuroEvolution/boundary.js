class Boundary {
    constructor(a, b) {
        this.ax = a.x;
        this.ay = a.y;
        this.bx = b.x;
        this.by = b.y;
        this.dist = p5.Vector.dist(a, b);
    }

    midpoint() {
        return createVector((this.ax + this.bx) * 0.5, (this.ay + this.by) * 0.5);
    }

    show(trans = 255) {
        stroke(trans);
        line(this.ax, this.ay, this.bx, this.by);
    }
}
