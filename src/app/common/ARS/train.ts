import { Normalizer } from "./normalizer";
import { Policy } from "./policy";
import { HyperParameters } from './hipper-param';
import { explore } from "./explorer";
import * as tf from '@tensorflow/tfjs'

const standardDeviation = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
}
export async function train(env: any, policy: Policy, normalizer: Normalizer, hp: HyperParameters) {
    let best_reward = -Infinity;


    for (let step = 0; step < hp.steps; step++) {
        // Inicialização das perturbações (deltas) e as recompensas positivas e negativas
        const deltas = policy.sampleDeltas(hp);
        const positive_rewards: number[] = new Array(hp.directions).fill(0);
        const negative_rewards: number[] = new Array(hp.directions).fill(0);

        // Obtendo as recompensas das direções positivas
        for (let k = 0; k < hp.directions; k++) {
            positive_rewards[k] = await explore(env, normalizer, policy, 'positive', deltas[k], hp);
        }

        // Obtendo as recompensas das direções negativas
        for (let k = 0; k < hp.directions; k++) {
            negative_rewards[k] = await explore(env, normalizer, policy, 'negative', deltas[k], hp);
        }

        // Obtendo todas as recompensas positivas e negativas para computar o desvio padrão dessas recompensas
        const all_rewards = positive_rewards.concat(negative_rewards);
        const sigma_r = standardDeviation(all_rewards);

        // Ordenação dos rollouts e seleção das melhores direções
        const scores: { [key: number]: number } = {};
        for (let k = 0; k < hp.directions; k++) {
            scores[k] = Math.max(positive_rewards[k], negative_rewards[k]);
        }
        const order = Object.keys(scores).sort((a, b) => scores[parseInt(b)] - scores[parseInt(a)]).slice(0, hp.bestDirections);

        const rollouts: Array<[number, number, tf.Tensor]> = order.map(k => [positive_rewards[parseInt(k)], negative_rewards[parseInt(k)], deltas[parseInt(k)]]);
        policy.update(rollouts, sigma_r, hp);

        const reward_evaluation = await explore(env, normalizer, policy, null, null, hp);
        console.log('Step: ', step, ' Reward: ', reward_evaluation);


        if (reward_evaluation > best_reward) {
            best_reward = reward_evaluation;

            console.log(`Best policy updated at step ${step} with reward ${best_reward}`);
        }
    }
}

