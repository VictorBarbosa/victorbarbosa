import Hp from "./hyper-param";

// Construção da inteligência artificial
export default class Policy {
    theta: number[][];


    constructor(inputSize: number, outputSize: number, private hp: Hp) {
        this.theta = Array(outputSize).fill(0).map(() => new Array(inputSize).fill(0));
    }

    evaluate(input: number[], delta?: number[][], direction?: string): number[] {
        let result = new Array(this.theta.length).fill(0);
        for (let i = 0; i < this.theta.length; i++) {
            let sum = 0;
            for (let j = 0; j < this.theta[i].length; j++) {
                if (!direction) {
                    sum += this.theta[i][j] * input[j];
                } else if (direction === 'positive') {
                    sum += (this.theta[i][j] + this.hp.noise * delta![i][j]) * input[j];
                } else if (direction === 'negative') {
                    sum += (this.theta[i][j] - this.hp.noise * delta![i][j]) * input[j];
                }
            }
            result[i] = sum;
        }
        return result;
    }

    sampleDeltas(): number[][][] {
        let deltas: number[][][] = [];
        for (let i = 0; i < this.hp.nbDirections; i++) {
            deltas.push(this.theta.map(row => row.map(() => Math.random())));
        }
        return deltas;
    }

    update(rollouts: [number, number, number[][]][], sigmaR: number): void {
        let step = this.theta.map(row => new Array(row.length).fill(0));
        rollouts.forEach(([rPos, rNeg, d]) => {
            step = step.map((row, i) => row.map((val, j) => val + (rPos - rNeg) * d[i][j]));
        });
        this.theta = this.theta.map((row, i) => row.map((val, j) => val + this.hp.learningRate / (this.hp.nbBestDirections * sigmaR) * step[i][j]));
    }

    save(filename: string): void {
        // Save this.theta to a file named filename
    }

    load(filename: string): void {
        // Load this.theta from a file named filename
    }
}