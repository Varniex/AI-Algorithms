class CartPoleEnv {
    constructor() {
        this.gravity = 9.8;
        this.masscart = 1.0;
        this.masspole = 0.1;
        this.carty = height - 100; // Top of Cart
        this.cartx = width / 2;
        this.total_mass = this.masspole + this.masscart;
        this.length = 0.5; // actually half the pole's length
        this.polemass_length = this.masspole * this.length;
        this.force_mag = 10.0;
        this.tau = 0.02; // seconds b/w state updates
        this.kinematics_integrator = "euler";

        // Angle at which to fail the episode
        // The episode ends when the pole is more than 15 degrees from vertical, or the cart moves more than 2.4 units from the center
        this.theta_threshold_radians = (12 * 2 * Math.PI) / 360;
        this.x_threshold = 2.4;

        let high = [this.x_threshold * 2, 3.4028235e38, this.theta_threshold_radians * 2, 3.4028235e38]; //np.finfo(np.float32).max = 3.4028235e38
        this.action_space = [0, 1];
        this.observation_space = [-high, high];
        this.seed();

        this.state = null;
        this.steps_beyond_done = null;
    }

    seed(seed = null) {
        return randomSeed(seed);
    }

    step(action) {
        let reward;
        let state = this.state;
        let x = state[0];
        let x_dot = state[1];
        let theta = state[2];
        let theta_dot = state[3];
        let force = action == 1 ? this.force_mag : -this.force_mag;
        let costheta = Math.cos(theta);
        let sintheta = Math.sin(theta);
        let temp = (force + this.polemass_length * theta_dot * theta_dot * sintheta) / this.total_mass;
        let thetacc =
            (this.gravity * sintheta - costheta * temp) / (this.length * (4.0 / 3.0 - (this.masspole * costheta * costheta) / this.total_mass));
        let xacc = temp - (this.polemass_length * thetacc * costheta) / this.total_mass;

        if (this.kinematics_integrator == "euler") {
            x += this.tau * x_dot;
            x_dot += this.tau * xacc;
            theta += this.tau * theta_dot;
            theta_dot += this.tau * thetacc;
        } else {
            x_dot += this.tau * xacc;
            x += this.tau * x_dot;
            theta_dot += this.tau * thetacc;
            theta += this.tau * theta_dot;
        }

        this.state = [x, x_dot, theta, theta_dot];
        let done = x < -this.x_threshold || x > this.x_threshold || theta < -this.theta_threshold_radians || theta > this.theta_threshold_radians;

        if (!done) {
            reward = 1.0;
        } else if (this.steps_beyond_done == null) {
            // Pole just fell
            this.steps_beyond_done = 0;
            reward = 1.0;
        } else {
            if (this.steps_beyond_done == 0) {
                console.log(
                    "You're calling 'step()' even though this environment has already returned done = 'true'. You should always call 'reset()' once you receive 'done = true' -- any further steps are undefined behaviour."
                );
            }
            this.steps_beyond_done += 1;
            reward = 0.0;
        }
        if (this.cartx < 0 || this.cartx > width) {
            done = true;
        }
        return [this.state, reward, done, {}];
    }

    reset() {
        this.state = [random(-1, 1), random(-1, 1), random(-0.161799, 0.161799), random(-0.161799, 0.161799)];
        this.steps_beyond_done = null;
        return this.state;
    }

    show(trans) {
        let world_width = this.x_threshold * 2;
        let scale = width / world_width;
        let polewidth = 10.0;
        let polelen = -scale * (2 * this.length);
        let cartwidth = 65.0;
        let cartheight = 45.0;
        let x = this.state;
        this.cartx = x[0] * scale + width / 2.0;

        if (this.viewer == null) {
            const cl = -cartwidth / 2;
            const cr = cartwidth / 2;
            const ct = -cartheight / 2;
            const cb = cartheight / 2;

            const axleoffset = -cartheight / 40.0;
            const pl = -polewidth / 2;
            const pr = polewidth / 2;
            const pt = polelen - polewidth / 2;
            const pb = -polewidth / 2;

            stroke(255, 200);
            line(0, this.carty, width, this.carty);

            push();
            translate(this.cartx, this.carty);
            fill(240, trans); // cart
            beginShape();
            vertex(cl, cb);
            vertex(cl, ct);
            vertex(cr, ct);
            vertex(cr, cb);
            endShape();
            fill(180, 20, 200, trans); // cart wheels
            circle(-cartwidth / 4, cartheight / 2, 14);
            circle(cartwidth / 4, cartheight / 2, 14);
            pop();

            push();
            translate(this.cartx, this.carty + axleoffset);
            rotate(x[2]);
            noStroke();
            fill(204, 153, 102, trans); // pole
            beginShape();
            vertex(pl, pb);
            vertex(pl, pt);
            vertex(pr, pt);
            vertex(pr, pb);
            endShape();
            fill(200, 0, 0, 200, trans); // pole hinge
            circle(0, 0, 12);
            pop();
        }

        if (this.state == null) {
            return null;
        }
    }
}
