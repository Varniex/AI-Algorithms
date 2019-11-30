class NN {
    constructor(a = 4, b = 10, c = 2) {
        this.w1 = Array(a)
            .fill()
            .map(() => Array(b).fill(0));
        this.b1 = Array(1)
            .fill()
            .map(() => Array(b).fill(0));

        this.w2 = Array(b)
            .fill()
            .map(() => Array(c).fill(0));
        this.b2 = Array(1)
            .fill()
            .map(() => Array(c).fill(0));

        this.w1 = this.randomize(this.w1);
        this.b1 = this.randomize(this.b1);
        this.w2 = this.randomize(this.w2);
        this.b2 = this.randomize(this.b2);
    }

    change(arr, rate) {
        let rows = arr.length;
        let cols = arr[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (random(1) < rate) {
                    arr[i][j] += random(-0.1, 0.1);
                }
            }
        }
    }

    mutate(rate) {
        this.change(this.w1, rate);
        this.change(this.w2, rate);
        this.change(this.b1, rate);
        this.change(this.b2, rate);
    }

    randomize(arr) {
        return arr.map((_, i) => arr[i].map(j => random(-1, 1)));
    }

    relu(x) {
        return x.map((_, i) => x[i].map(j => (j > 0 ? j : 0)));
    }

    tanh(x) {
        return x.map((_, i) => x[i].map(j => Math.tanh(j)));
    }

    sigmoid(x) {
        return x.map((_, i) => x[i].map(j => 1 / (1 + exp(-j))));
    }

    copy() {
        return new NN(this);
    }

    add(x, y) {
        if (x.length === y.length && x[0].length === y[0].length) {
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

    matmul(x, y) {
        if (x[0].length === y.length) {
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

    predict(ip) {
        let l1 = Array(ip);
        let l2 = this.sigmoid(this.add(this.matmul(l1, this.w1), this.b1));
        let l3 = this.tanh(this.add(this.matmul(l2, this.w2), this.b2));

        return l3[0];
    }
}
