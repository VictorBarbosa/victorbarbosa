
export class HyperParameters {
    steps: number = 0;
    episodeLength: number = 0;
    learningRate: number = 0;
    directions: number = 0;
    bestDirections: number = 0;
    noise: number = 0;
    seed: number = 0;
    constructor() {
        this.steps = 100000
        this.episodeLength = 1000
        this.learningRate = 0.02
        this.directions = 32
        this.bestDirections = 32
        this.noise = 0.03
        this.seed = 1
        if (this.bestDirections >= this.directions) {
            throw new Error("Best directions could be smaller than directions")
        }
    }
}