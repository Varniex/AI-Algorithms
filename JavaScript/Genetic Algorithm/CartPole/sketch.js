let carts = [];
const population = 100;
let score = 0;
let fit = null;
let maxScore = 0;
let generation = 1;
let mutation_rate = 0.1;

function child(brain, rate) {
    let newCarts = [];
    for (let i = 0; i < population; i++) {
        let brn = brain.mutate(rate);
        newCarts.push(new Cart(brn));
    }
    return newCarts;
}

function rebirth() {
    generation++;
    score = 0;
    carts = child(fit.brn, mutation_rate);
}

function setup() {
    createCanvas(600, 400);
    for (let i = 0; i < population; i++) {
        carts.push(new Cart());
    }
}

function draw() {
    background(20);
    noStroke();
    fill(255);
    textSize(20);
    text("Score: " + score, width - 160, 50);
    text("Max Score: " + maxScore, width - 160, 80);
    text("Generation: " + generation, width - 160, 110);

    // stars
    stroke(200, 200);
    for (let i = 0; i < width; i += 2) {
        point(i, (height - 60) * noise(i));
    }

    for (let i = carts.length - 1; i >= 0; i--) {
        let move = carts[i].brn.predict(carts[i].obs);
        if (move[0] > move[1]) {
            carts[i].move(1);
        } else {
            carts[i].move(0);
        }
        carts[i].show(200);
        if (carts[i].done) {
            carts.splice(i, 1);
        }
    }

    for (let c of carts) {
        if (c.fitness_score >= score) {
            score = c.fitness_score;
            fit = c;
        }
    }
    fit.show();

    maxScore = max(score, maxScore);

    if (carts.length < 1) {
        rebirth();
    }
}
