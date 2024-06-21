
import * as tf from '@tensorflow/tfjs';
import { TensorflowSettings } from "./tensorflow-settings";
import { BehaviorSubject, distinctUntilChanged, shareReplay } from "rxjs";
import Main from './main';
export abstract class ITensorflowSettings extends Main {
    /** Input data for the model */
    inputs: number[][] = [];

    /** Labels for the model */
    labels: number[] = [];

    /** TensorFlow settings */
    settings!: TensorflowSettings;

    abstract settingTensorflow(): void;
 
    /*
* Model
*/
    readonly _model = new BehaviorSubject<tf.Sequential | tf.LayersModel | null>(null);
    model$ = this._model.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

    /*
    * Model getter
    */
    get model(): tf.Sequential | tf.LayersModel | null {
        return this._model.getValue();
    }

    /*
    * Model setter
    */
    set model(value: tf.Sequential | tf.LayersModel | null) {
        if (this._model.getValue() !== value) {
            this._model.next(value);
        }
    }

    constructor(modelTrainned?: tf.Sequential | tf.LayersModel | null) {
        super();
        this.createData();
        this.settingTensorflow();
        if (modelTrainned) {
            this.model = modelTrainned
        }
    }

    abstract createData(): void
    abstract setScenario(): void

}


