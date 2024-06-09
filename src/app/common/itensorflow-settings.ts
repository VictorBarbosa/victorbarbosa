
import { TensorflowSettings } from "./tensorflow-settings";

export interface ITensorflowSettings {
    /** Input data for the model */
    inputs: number[][];

    /** Labels for the model */
    labels: number[];

    /** TensorFlow settings */
    settings: TensorflowSettings;

    settingTensorflow(): void;


}