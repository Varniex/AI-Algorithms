class Car {
    constructor(pos, brain = null) {
        this.pos = pos;
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.size = 10;
        this.life = 5;
        this.maxVel = 5;
        this.rays = [];
        this.temp_rays = [];
        this.dead = false;
        this.sight = 50;
        this.fitness = 0;
        this.index = 0;

        for (let i = -30; i < 30; i += 10) {
            this.rays.push(new Ray(this.pos, radians(i)));
        }
        for (let i = -45; i <= 45; i++) {
            this.temp_rays.push(new Ray(this.pos, radians(i)));
        }

        if (this.brain != null) {
            this.brn = brain;
        } else {
            this.brn = new NN(this.rays.length, 2 * this.rays.length, 2);
        }
    }

    move(force) {
        this.acc.add(force);
    }

    hit(walls, render = false) {
        let rays;
        let scene = [];
        let inputs = [];
        if (render) {
            rays = this.temp_rays;
        } else {
            rays = this.rays;
        }
        for (let r of rays) {
            let distance = Infinity;
            let closest = null;
            for (let w = 0; w < walls.length; w++) {
                const pt = r.cast(walls[w]);
                if (pt) {
                    let d = p5.Vector.dist(pt, this.pos);
                    const a = r.dir.heading() - this.vel.heading();
                    d *= cos(a);
                    if (d < distance) {
                        distance = d;
                        closest = pt;
                    }
                }
            }
            scene.push(distance);
            if (render && closest) {
                stroke(255, 50);
                line(this.pos.x, this.pos.y, closest.x, closest.y);
            }
            if (!render) {
                inputs.push(map(distance, 0, this.sight, 1, 0));
                if (distance < 3) {
                    this.dead = true;
                }
            }
        }
        if (!render) {
            let action = this.brn.predict(inputs);
            let angle = map(action[0], -1, 1, -PI, PI);
            let force = map(action[1], -1, 1, -this.maxVel, this.maxVel);
            angle += this.vel.heading();
            let steer = p5.Vector.fromAngle(angle, force);
            steer.sub(this.vel);
            steer.limit(maxAcc);
            this.move(steer);
        }

        return scene;
    }

    modify_rays() {
        this.rays = [];
        this.temp_rays = [];
        for (let i = -30; i < 30; i += 10) {
            this.rays.push(new Ray(this.pos, radians(i)));
        }
        for (let i = -60; i <= 60; i += 1) {
            this.temp_rays.push(new Ray(this.pos, radians(i)));
        }
    }

    update() {
        this.life -= 0.08;
        this.life = min(this.life, 10);
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        this.vel.limit(this.maxVel);
        this.acc.mult(0);

        if (this.pos.x > width / 2 || this.pos.x < 0 || this.pos.y < 0 || this.pos.y > height || this.life <= 0) {
            this.dead = true;
        }

        checkpoints[this.index].show(150);
        for (let r of this.rays) {
            const ptC = r.cast(checkpoints[this.index]);
            if (ptC) {
                const d = p5.Vector.dist(ptC, this.pos);

                if (d < 15) {
                    this.fitness++;
                    this.index = (this.index + 1) % checkpoints.length;
                    this.life += 0.7;
                }
            }
        }

        if (this.fitness == 5 * checkpoints.length) {
            this.fitness += 2;
            this.life += 1;
            buildTrack(true);
            cars.push(new Car(startPoint.copy(), fit.brn));
        }

        for (let i = 0; i < this.rays.length; i++) {
            this.rays[i].rotate(this.vel.heading());
        }
        for (let j = 0; j < this.temp_rays.length; j++) {
            this.temp_rays[j].rotate(this.vel.heading());
        }
    }

    calcFitness() {
        return pow(this.fitness, 2);
    }

    show(fittest = false) {
        let angle = this.vel.heading();
        push();
        translate(this.pos.x, this.pos.y);
        rotate(angle);
        if (fittest) {
            fill(200, 20, 200, 240);
        } else {
            fill(200, 50);
        }
        rectMode(CENTER);
        rect(0, 0, this.size, this.size * 0.6);
        pop();
    }
}
