import { Layer } from '@tensorflow/tfjs-layers/dist/engine/topology';
import { ModelCompileArgs, ModelFitArgs } from '@tensorflow/tfjs';

interface TensorflowSettings {
  inputs: number[][];
  labels: number[];
  mainLayers: Layer[];
  finalLayer: Layer;
  compiler: ModelCompileArgs;
  fit: ModelFitArgs;
}

export { ModelCompileArgs, ModelFitArgs, Layer, TensorflowSettings }