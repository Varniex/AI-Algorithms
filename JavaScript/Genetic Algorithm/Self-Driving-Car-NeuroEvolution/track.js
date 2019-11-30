// Neuro-Evolution in Perlin Noise

const POPULATION = 100;
const TOTAL = 50;
const maxAcc = 0.2;
const MUTATION_RATE = 0.1;
let cars = Array(POPULATION);
let checkpoints;
let walls;
let fit = null;
let score = 0;
let stepSize = 1;
let generation = 1;
let maxScore;
let track_num = 0;

let innerCircle;
let outerCircle;
let startPoint;

function rebirth(fit_car) {
    generation++;
    cars = child(fit_car);
    score = 0;
    fit = null;
}

function child(fit_car) {
    let new_cars = Array(POPULATION);
    for (let i = 0; i < POPULATION; i++) {
        let brain = fit_car.brn.mutate(MUTATION_RATE);
        new_cars[i] = new Car(startPoint.copy(), brain);
    }
    return new_cars;
}

function buildTrack(preCar = false) {
    maxScore = 0;
    track_num++;
    checkpoints = [];
    walls = [];
    innerCircle = [];
    outerCircle = [];
    const space = 30;
    const MAX_NOISE = 4;
    let start = random(1000);
    let end = random(1000);
    for (let i = 0; i < TOTAL; i++) {
        let a = map(i, 0, TOTAL, 0, TWO_PI);
        let xoff = map(cos(a), -1, 1, 0, MAX_NOISE) + start;
        let yoff = map(sin(a), -1, 1, 0, MAX_NOISE) + end;

        let xr = map(noise(xoff, yoff), 0, 1, 100, (width / 2) * 0.5);
        let yr = map(noise(xoff, yoff), 0, 1, 100, height * 0.5);

        let x1 = width / 4 + (xr - space) * cos(a);
        let y1 = height / 2 + (yr - space) * sin(a);
        innerCircle.push(createVector(x1, y1));

        let x2 = width / 4 + (xr + space) * cos(a);
        let y2 = height / 2 + (yr + space) * sin(a);
        outerCircle.push(createVector(x2, y2));
    }

    outerCircle.push(outerCircle[0]);
    innerCircle.push(innerCircle[0]);

    for (let i = 0; i < TOTAL; i++) {
        walls.push(new Boundary(outerCircle[i], outerCircle[i + 1]));
        walls.push(new Boundary(innerCircle[i], innerCircle[i + 1]));
    }

    for (let i = 0; i < walls.length; i += 2) {
        let outer = walls[i];
        let inner = walls[i + 1];
        let check = new Boundary(outer.midpoint(), inner.midpoint());
        if (check.dist <= 40) {
            buildTrack();
        } else {
            checkpoints.push(check);
        }
    }

    startPoint = checkpoints[0].midpoint();

    if (!preCar) {
        for (let i = 0; i < POPULATION; i++) {
            cars[i] = new Car(startPoint.copy());
        }
    } else {
        for (let i = 0; i < cars.length; i++) {
            cars[i].pos = startPoint.copy();
            cars[i].vel.normalize();
            cars[i].index = 1;
            cars[i].fitness = 0;
            cars[i].modify_rays();
        }
    }
}

function setup() {
    createCanvas(1200, 600);
    buildTrack();
}

function draw() {
    background(11, 102, 35);
    stroke(255);
    // for (let i = 0; i < walls.length; i++) {
    //     walls[i].show();
    // }
    fill(100);
    beginShape();
    for (let i = 0; i < outerCircle.length; i++) {
        vertex(outerCircle[i].x, outerCircle[i].y);
    }
    endShape();
    fill(11, 102, 35);
    beginShape();
    for (let i = 0; i < outerCircle.length; i++) {
        vertex(innerCircle[i].x, innerCircle[i].y);
    }
    endShape();
    checkpoints[0].show();

    for (let step = 0; step < stepSize; step++) {
        for (let i = cars.length - 1; i >= 0; i--) {
            cars[i].hit(walls);
            cars[i].update();
            cars[i].show();

            if (cars[i].calcFitness() >= score) {
                score = cars[i].calcFitness();
                fit = cars[i];
            }

            if (cars[i].dead) {
                cars.splice(i, 1);
            }
        }
        maxScore = max(maxScore, fit.fitness);

        fill(20);
        rect(width / 2, 0, width / 2, height);
        if (fit.fitness >= 100) {
            // pov of fittest car starts
            const scene = fit.hit(walls, true);
            const wid = width / (2 * scene.length);
            const sceneW = width / 3.7;
            const sceneH = height;
            const wSq = sceneW * sceneW;
            push();
            noStroke();
            translate(width / 2, 0);
            fill(255, 80);
            rect(0, 0, width / 2, sceneH / 2);
            fill(255, 0, 0, 80);
            rect(0, sceneH / 2, width / 2, sceneH / 2);

            for (let sc = 0; sc < scene.length; sc += 1) {
                const sq = scene[sc] * scene[sc];

                const b = map(sq, 0, wSq, 255, 0);
                const h = (20 * height) / scene[sc]; //map(scene[sc], 0, width, 4000, 0); //h = constant/scene[sc];

                fill(255 - b, abs(127 - b), b);
                rectMode(CENTER);
                rect(sc * wid + wid / 2, sceneH / 2, wid + 1, h);
            }
            pop();
            // pov of fittest car ends
        }
        fit.show(true);
        if (cars.length < 1) {
            rebirth(fit);
        }
    }
    line(width / 2, 0, width / 2, height);

    if (fit) {
        noStroke();
        fill(255);
        textSize(16);
        text(`Track #${track_num}`, 10, 25);
        text(`Laps: ${parseInt(fit.fitness / checkpoints.length)}`, 10, 45);
        text(`Health: ${parseInt(fit.life)}`, 10, 65);
        text(`Velocity:  ${fit.vel.mag().toFixed(2)}`, 10, 85);

        text(`Score: ${fit.fitness}`, width / 2 - 125, 25);
        text(`Max Score: ${maxScore}`, width / 2 - 125, 45);
        text(`Generation: ${generation}`, width / 2 - 125, 65);

        if (fit.fitness < 100) {
            push();
            textSize(32);
            textAlign(CENTER);
            stroke(200, 20, 255, 200);
            strokeWeight(4);
            fill(255);
            text(`POV will be displayed after a car\n completes 2 laps.`, (3 * width) / 4, height / 2);
            pop();
        }
    }
}
