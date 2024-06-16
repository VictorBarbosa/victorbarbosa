import * as tf from '@tensorflow/tfjs'
import { HyperParameters } from './hipper-param';
export class Policy {
    theta: tf.Tensor;

    constructor(input_size: number, output_size: number, private hp: HyperParameters) {
        this.theta = tf.zeros([output_size, input_size]);
    }

    evaluate(input: tf.Tensor, delta: tf.Tensor | null = null, direction: string | null = null): tf.Tensor {
        if (direction === null) {
            return this.theta.dot(input);
        } else if (direction === 'positive') {
            return this.theta.add(delta!.mul(tf.scalar(this.hp.noise))).dot(input);
        } else {
            return this.theta.sub(delta!.mul(tf.scalar(this.hp.noise))).dot(input);
        }
    }

    sampleDeltas(hp: HyperParameters): tf.Tensor[] {
        return Array.from({ length:  hp.directions }, () => tf.randomNormal(this.theta.shape));
    }

    update(rollouts: Array<[number, number, tf.Tensor]>, sigma_r: number,hp:HyperParameters) {
        let step = tf.zeros(this.theta.shape);
        for (const [r_pos, r_neg, d] of rollouts) {
            step = step.add(d.mul(tf.scalar(r_pos - r_neg)));
        }
        this.theta = this.theta.add(step.mul(tf.scalar(hp.learningRate / (hp.bestDirections * sigma_r))));
    }

    save(filename: string) {
        // const data = this.theta.arraySync();
        // fs.writeFileSync(filename, JSON.stringify(data));
    }

    load(filename: string) {
        // const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        // this.theta = tf.tensor(data);
    }
}