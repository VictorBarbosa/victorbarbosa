import { HyperParameters } from "./hipper-param";
import { Normalizer } from "./normalizer";
import { Policy } from "./policy";
import * as tf from '@tensorflow/tfjs'
export async function explore(env: any, normalizer: Normalizer, policy: Policy, direction: string | null = null, delta: tf.Tensor | null = null, hp: HyperParameters): Promise<number> {
    let state = tf.tensor(await env.reset());
    let done = false;
    let num_plays = 0;
    let sum_rewards = 0;

    while (!done && num_plays < hp.episodeLength) {
        normalizer.observe(state);
        state = normalizer.normalize(state);
        const action = policy.evaluate(state, delta, direction);
        const [observation, reward, terminated] = await env.step(action.argMax(-1).arraySync());
        state = tf.tensor(observation);
        done = terminated;
        sum_rewards += Math.max(Math.min(reward, 1), -1);
        num_plays += 1;
    }
    return sum_rewards;
}
