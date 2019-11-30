let pipes = [];
let frameCount = 0;
const population = 500;
let birds = [];
let fit;
let canvas;
let h1;
let p1, p2, p3;
let anchor;
let generation = 1;
let sc = 0;
let maxScore = 0;
let slider;
let radio;
let mutation = 0.01;
let bbs = false;

function rebirth() {
    generation++;
    birds = child(fit.brn, mutation);
    pipes = [];
    pipes.push(new Pipe());
    frameCount = 0;
    sc = 0;
    bbs = false;
}

function deserialize(data) {
    let nn = new NN(data.a, data.b, data.c);
    nn.w_ih = data.w_ih;
    nn.w_ho = data.w_ho;
    nn.b_ih = data.b_ih;
    nn.b_ho = data.b_ho;
    return nn;
}

function bestBirdSelect() {
    bbs = true;
    pipes = [];
    frameCount = 0;
    sc = 0;
    let birdBrain = deserialize(best_bird);
    birds = [new Bird(birdBrain)];
}

function reset() {
    bbs = false;
    generation = 1;
    fit = null;
    pipes = [];
    maxScore = 0;
    frameCount = 0;
    sc = 0;
    birds = [];
    for (let i = 0; i < population; i++) {
        birds.push(new Bird());
    }
}

function child(brain, rate) {
    let new_birds = [];
    for (let i = 0; i < population; i++) {
        let brn = brain.copy().mutate(rate);
        new_birds.push(new Bird(brn));
    }
    return new_birds;
}

function setup() {
    canvas = createCanvas(1200, 400);
    h1 = createElement("h1", "Flappy Bird Neuro-Evolution");
    canvas.position(windowWidth / 2 - width / 2, (3.3 * windowHeight) / 10);
    h1.position(windowWidth / 2, 0);
    h1.center("horizontal");

    p1 = createP("Watch an AI learns to play Flappy Bird through Neuro-Evolution!");
    p1.position(windowWidth / 2, windowHeight / 10);
    p1.center("horizontal");

    p2 = createP("Want to play by yourself?");
    p2.position(windowWidth / 10, (2 * windowHeight) / 10);

    p3 = createP("To speed up the process, use slider:");
    p3.position(windowWidth - (1.3 * windowWidth) / 5, (2 * windowHeight) / 10);

    p4 = createP("Select one of the options: ");
    p4.position(windowWidth / 2, (1.7 * windowHeight) / 10);
    p4.center("horizontal");

    anchor = createA("https://dvirtual.github.io/Flappy-Bird", "Click Here!");
    anchor.position(windowWidth / 10, (2.7 * windowHeight) / 10);

    slider = createSlider(1, 10, 1);
    slider.size(windowWidth / 10);
    slider.position(windowWidth - (1.3 * windowWidth) / 5, (2.7 * windowHeight) / 10);

    radio = createRadio();
    radio.option("Best Bird");
    radio.option("Train");

    radio.position(windowWidth / 2, (2.7 * windowHeight) / 10);
    radio.center("horizontal");

    for (let i = 0; i < population; i++) {
        birds.push(new Bird());
    }
}

function draw() {
    background(10);

    let val = radio.value();

    if (val == "Best Bird" && !bbs) {
        bestBirdSelect();
    } else if (val == "Train" && bbs) {
        reset();
    }

    if (sc >= maxScore) {
        maxScore = sc;
    }

    for (let step = 0; step < slider.value(); step++) {
        let mx = 0;
        for (let b of birds) {
            if (b.points >= mx) {
                mx = b.points;
                fit = b;
            }
            b.update();
            b.show();
        }

        if (frameCount % 80 == 0) {
            pipes.push(new Pipe());
        }

        for (let i = birds.length - 1; i >= 0; i--) {
            let cP = birds[i].closestPipe();
            let arr = [cP.x / width, (cP.top + 10) / height, (cP.bottom - 10) / height, birds[i].v / 10, birds[i].y / height]; //pay attention to inputs
            let dec = birds[i].brn.brain(arr);
            if (dec[0] > dec[1]) {
                birds[i].up();
            }

            if (cP.hit(birds[i]) || birds[i].y - birds[i].r <= 0 || birds[i].y + birds[i].r >= height) {
                birds.splice(i, 1);
            }
        }

        if (birds.length < 1) {
            rebirth();
        }

        for (let k = 0; k < pipes.length; k++) {
            pipes[k].update();
            pipes[k].show();
            if (pipes[k].x + pipes[k].w < 0) {
                sc++;
                pipes.splice(k, 1);
                k--;
            }
        }
        frameCount++;
    }
    noStroke();
    fill(255);
    textSize(20);
    text("Score: " + sc, width - 150, 50);
    text("Max Score: " + maxScore, width - 150, 80);
    if (!bbs) text("Generation: " + generation, width - 150, 110);

    fit.fittest();
}
