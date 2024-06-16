import * as tf from '@tensorflow/tfjs'
 

export class Normalizer {
    n: tf.Tensor;
    mean: tf.Tensor;
    mean_diff: tf.Tensor;
    var: tf.Tensor;

    constructor(nb_inputs: number) {
        this.n = tf.zeros([nb_inputs]);
        this.mean = tf.zeros([nb_inputs]);
        this.mean_diff = tf.zeros([nb_inputs]);
        this.var = tf.zeros([nb_inputs]);
    }

    observe(x: tf.Tensor): void {
        const n_plus_one = this.n.add(tf.scalar(1));
        const last_mean = this.mean.clone();
        this.mean = this.mean.add(x.sub(this.mean).div(n_plus_one));
        this.mean_diff = this.mean_diff.add(x.sub(last_mean).mul(x.sub(this.mean)));
        this.var = this.mean_diff.div(n_plus_one).clipByValue(1e-2, Infinity);
        this.n = n_plus_one;
    }

    normalize(inputs: tf.Tensor): tf.Tensor {
        const obs_std = this.var.sqrt();
        return inputs.sub(this.mean).div(obs_std);
    }
}