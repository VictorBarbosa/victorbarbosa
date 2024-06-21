import Agent from "../../pages/starship-landing-super-vized/agent";
import Hp from "./hyper-param";
import Normalizer from "./normalizer";
import Policy from "./policy";

// Explora a política em uma direção específica e dentro de um episódio
export const explore = (env: Agent, normalizer: Normalizer, policy: Policy, hp: Hp, direction?: string, delta?: number[][],): number => {
    let state: any = env.resetEnvironment()._state;
    let done = false;
    let numPlays = 0;
    let sumRewards = 0;

    while (!done && numPlays < hp.episodeLength) {
        normalizer.observe(state);
        state = normalizer.normalize(state);
        let action = policy.evaluate(state, delta, direction);
        let maxActionIndex = action.reduce((maxIndex, current, index, arr) => current > arr[maxIndex] ? index : maxIndex, 0);
        let { _state, reward, terminated } = env.step(maxActionIndex);
        state = _state;
        done = terminated;
        reward = Math.max(Math.min(reward, 1), -1);
        sumRewards += reward;
        numPlays += 1;
    }
    return sumRewards;

}