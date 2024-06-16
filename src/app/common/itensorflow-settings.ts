
import * as tf from '@tensorflow/tfjs';
import { TensorflowSettings } from "./tensorflow-settings";
import Matter from "matter-js";
import { BehaviorSubject, distinctUntilChanged, shareReplay } from "rxjs";
export abstract class ITensorflowSettings {
    /** Input data for the model */
    inputs: number[][] = [];

    /** Labels for the model */
    labels: number[] = [];

    /** TensorFlow settings */
    settings!: TensorflowSettings;

    abstract settingTensorflow(): void;

    //
    width: number = window.innerWidth;

    //
    height: number = window.innerHeight;


    Engine = Matter.Engine;
    Render = Matter.Render;
    Runner = Matter.Runner;
    Bodies = Matter.Bodies;
    Composite = Matter.Composite;

    Composites = Matter.Composites;
    Constraint = Matter.Constraint;
    MouseConstraint = Matter.MouseConstraint;
    Mouse = Matter.Mouse;
    Body = Matter.Body;
    Vector = Matter.Vector;
    engine!: Matter.Engine;
    render!: Matter.Render;

    // create engine
    world!: Matter.World


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
        this.engine = this.Engine.create();
        this.world = this.engine.world;
        this.createData();
        this.settingTensorflow();
        if (modelTrainned) {
            this.model = modelTrainned
        }
    }

    abstract createData(): void
    abstract setScenario(): void

}


