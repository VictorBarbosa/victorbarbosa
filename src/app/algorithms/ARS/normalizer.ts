export default class Normalizer {
    n: number[];
    mean: number[];
    meanDiff: number[];
    var: number[];

    constructor(nbInputs: number) {
        this.n = new Array(nbInputs).fill(0);
        this.mean = new Array(nbInputs).fill(0);
        this.meanDiff = new Array(nbInputs).fill(0);
        this.var = new Array(nbInputs).fill(0);
    }

    observe(x: number[]): void {
        console.log('Observing:', x);
        for (let i = 0; i < x.length; i++) {
            this.n[i] += 1;
            let lastMean = this.mean[i];
            this.mean[i] += (x[i] - this.mean[i]) / this.n[i];
            this.meanDiff[i] += (x[i] - lastMean) * (x[i] - this.mean[i]);
            this.var[i] = Math.max(this.meanDiff[i] / this.n[i], 1e-2);
        }
        console.log('n:', this.n);
        console.log('mean:', this.mean);
        console.log('meanDiff:', this.meanDiff);
        console.log('var:', this.var);
    }

    normalize(inputs: number[]): number[] {
        console.log('Normalizing inputs:', inputs);
        const epsilon = 1e-8; // pequeno valor para evitar divisão por zero
        let obsMean = this.mean;
        let obsStd = this.var.map(Math.sqrt);
        console.log('obsMean:', obsMean);
        console.log('obsStd:', obsStd);
        const normalized = inputs.map((input, i) => (input - obsMean[i]) / (obsStd[i] + epsilon));
        console.log('Normalized output:', normalized);
        return normalized;
    }
}