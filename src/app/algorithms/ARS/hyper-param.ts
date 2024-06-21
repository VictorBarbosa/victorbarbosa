export default class Hp {
    nbSteps: number;
    episodeLength: number;
    learningRate: number;
    nbDirections: number;
    nbBestDirections: number;
    noise: number;
    seed: number;
    envName: string;

    constructor() {
        this.nbSteps = 10;
        this.episodeLength = 10;
        this.learningRate = 0.02;
        this.nbDirections = 32;
        this.nbBestDirections = 32;
        if (this.nbBestDirections > this.nbDirections) {
            throw new Error("nbBestDirections deve ser menor ou igual a nbDirections");
        }
        this.noise = 0.03;
        this.seed = 1;
        this.envName = 'LunarLander-v2';
    }
}