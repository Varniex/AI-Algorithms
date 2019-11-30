class NN {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;

        this.w_ih = Array(a)
            .fill()
            .map(() => Array(b).fill(0));
        this.b_ih = Array(1)
            .fill()
            .map(() => Array(b).fill(0));

        this.w_ho = Array(b)
            .fill()
            .map(() => Array(c).fill(0));
        this.b_ho = Array(1)
            .fill()
            .map(() => Array(c).fill(0));

        this.randomize(this.w_ih);
        this.randomize(this.w_ho);
        this.randomize(this.b_ih);
        this.randomize(this.b_ho);
    }

    randomize(arr) {
        let rows = arr.length;
        let cols = arr[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                arr[i][j] = randomGaussian(0, 1);
            }
        }
    }

    copy() {
        return new NN(this);
    }

    add(x, y) {
        if (x.length == y.length && x[0].length == y[0].length) {
            let rows = x.length;
            let cols = x[0].length;
            let op = Array(rows)
                .fill()
                .map(() => Array(cols).fill(0));
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    op[i][j] = x[i][j] + y[i][j];
                }
            }
            return op;
        } else {
            console.log("Error");
            return;
        }
    }

    mul(x, y) {
        let op = 0;
        if (x.length == y.length) {
            for (let i = 0; i < x.length; i++) {
                op += x[i] * y[i];
            }
            return op;
        }
        return;
    }

    matmul(x, y) {
        if (x[0].length == y.length) {
            let op = Array(x.length)
                .fill()
                .map(() => Array(y[0].length).fill(0));
            for (let i = 0; i < x.length; i++) {
                for (let j = 0; j < y[0].length; j++) {
                    for (let k = 0; k < y.length; k++) {
                        op[i][j] += x[i][k] * y[k][j];
                    }
                }
            }
            return op;
        } else {
            console.log("Error");
            return;
        }
    }

    sigmoid(x) {
        let rows = x.length;
        let cols = x[0].length;
        let op = Array(rows)
            .fill()
            .map(() => Array(cols).fill(NaN));
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                op[i][j] = 1 / (1 + exp(-x[i][j]));
            }
        }
        return op;
    }

    softmax(x) {
        let op = [];
        let sm = 0;
        for (let i = 0; i < x.length; i++) {
            sm += exp(x[i]);
        }
        for (let i = 0; i < x.length; i++) {
            op.push(exp(x[i]) / sm);
        }
        return op;
    }

    brain(arr) {
        let ip = Array(arr);
        let ih = this.sigmoid(this.add(this.matmul(ip, this.w_ih), this.b_ih));
        let op = this.sigmoid(this.add(this.matmul(ih, this.w_ho), this.b_ho));
        return op[0];
    }

    change(arr, rate) {
        let rows = arr.length;
        let cols = arr[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (random(1) < rate) {
                    arr[i][j] += randomGaussian(0, 0.1);
                }
            }
        }
    }

    mutate(rate) {
        this.change(this.w_ih, rate);
        this.change(this.w_ho, rate);
        this.change(this.b_ih, rate);
        this.change(this.b_ho, rate);
    }

    show() {
        noStroke();
        fill(255, 60, 60);
        for (let i = -this.a / 2; i < this.a / 2; i++) {
            circle(10, 20 * i + 120, 8);
        }
        fill(60, 255, 60);
        for (let i = -this.b / 2; i < this.b / 2; i++) {
            circle(50, 20 * i + 120, 8);
        }
        fill(60, 60, 255);
        for (let i = -this.c / 2; i < this.c / 2; i++) {
            circle(90, 20 * i + 120, 8);
        }

        stroke(255);
        for (let i = 0; i < this.a; i++) {
            for (let j = 0; j < this.b; j++) {
                let st = map(this.w_ih[i][j], -1, 1, 0, 0.6);
                strokeWeight(st);
                line(10, 20 * (i - this.a / 2) + 120, 50, 20 * (j - this.b / 2) + 120);
            }
        }

        for (let i = 0; i < this.b; i++) {
            for (let j = 0; j < this.c; j++) {
                let st = map(this.w_ho[i][j], -1, 1, 0, 0.6);
                strokeWeight(st);
                line(50, 20 * (i - this.b / 2) + 120, 90, 20 * (j - this.c / 2) + 120);
            }
        }
    }
}
