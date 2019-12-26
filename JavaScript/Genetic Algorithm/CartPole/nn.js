class NN {
    constructor(a, b, c) {
        this.w_ih = Array(a)
            .fill()
            .map(() => Array(b).fill(0));

        this.w_ho = Array(b)
            .fill()
            .map(() => Array(c).fill(0));

        this.b_ih = Array(1)
            .fill()
            .map(() => Array(b).fill(0));

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
                arr[i][j] = randomGaussian();
            }
        }
    }

    sigmoid(x) {
        let rows = x.length;
        let cols = x[0].length;
        let op = Array(rows)
            .fill()
            .map(() => Array(cols).fill(0));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                op[i][j] = 1 / (1 + exp(-x[i][j]));
            }
        }
        return op;
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
            console.log("Error!");
            return;
        }
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
            console.log("Error!");
            return;
        }
    }

    predict(ip) {
        ip = Array(ip);
        let hidden = this.sigmoid(this.add(this.matmul(ip, this.w_ih), this.b_ih));
        let op = this.sigmoid(this.add(this.matmul(hidden, this.w_ho), this.b_ho));
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

    //show(){}
}
