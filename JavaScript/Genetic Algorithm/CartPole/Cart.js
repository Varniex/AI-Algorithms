class Cart {
    constructor(brain = null) {
        this.env = new CartPoleEnv();
        this.obs = this.env.reset();
        this.done = false;
        this.fitness_score = 0;
        if (brain) {
            this.brn = brain;
        } else {
            this.brn = new NN(4, 8, 2);
        }
    }

    move(action) {
        let result = this.env.step(action);
        this.obs = result[0];
        this.fitness_score += result[1];
        this.done = result[2];

        if (this.fitness_score >= 5000) {
            noLoop();
        }
    }

    show(trans = 255) {
        this.env.show(trans);
    }
}
