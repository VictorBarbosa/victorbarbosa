import Agent from "../../pages/starship-landing-super-vized/agent";
import { explore } from "./explorer";
import Hp from "./hyper-param";
import Normalizer from "./normalizer";
import Policy from "./policy";



export function train(env: Agent, policy: Policy, normalizer: Normalizer, hp: Hp): void {
    let bestReward = -Infinity;

    for (let step = 0; step < hp.nbSteps; step++) {

        let deltas = policy.sampleDeltas();
        let positiveRewards = new Array(hp.nbDirections).fill(0);
        let negativeRewards = new Array(hp.nbDirections).fill(0);

        for (let k = 0; k < hp.nbDirections; k++) {
            positiveRewards[k] = explore(env, normalizer, policy, hp, 'positive', deltas[k]);
        }

        for (let k = 0; k < hp.nbDirections; k++) {
            negativeRewards[k] = explore(env, normalizer, policy, hp, 'negative', deltas[k]);
        }

        let allRewards = positiveRewards.concat(negativeRewards);
        let sigmaR = standardDeviation(allRewards);

        let scores: { [key: number]: number } = {};
        positiveRewards.forEach((r, k) => scores[k] = Math.max(r, negativeRewards[k]));
        let order = Object.keys(scores).map(Number).sort((a, b) => scores[b] - scores[a]).slice(0, hp.nbBestDirections);
        let rollouts = order.map(k => [positiveRewards[k], negativeRewards[k], deltas[k]] as [number, number, number[][]]);

        policy.update(rollouts, sigmaR);

        let rewardEvaluation = explore(env, normalizer, policy, hp,);
        console.log('Step:', step, 'Reward:', rewardEvaluation);

        if (rewardEvaluation > bestReward) {
            bestReward = rewardEvaluation;

            console.log(`Best policy updated at step ${step} with reward ${bestReward}`);
        }
    }
}
export const standardDeviation = (arr: number[]): number => {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((acc, val) => acc + val, 0) / arr.length);
}