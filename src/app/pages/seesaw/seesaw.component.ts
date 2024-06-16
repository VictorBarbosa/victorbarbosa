import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ITensorflowSettings } from '../../common/itensorflow-settings';
import Matter from 'matter-js';
import Car, { Direction } from './car';
import * as tf from '@tensorflow/tfjs';
import { TensorflowVisSampleComponent } from '../../common/tensorflow-visualization/tensorflow-visualization.component';
import { CommonModule } from '@angular/common';


interface Data {
  wheelBY: number,
  wheelAY: number,
  action: Direction
}
@Component({
  selector: 'app-seesaw',
  standalone: true,
  imports: [CommonModule, TensorflowVisSampleComponent],
  templateUrl: './seesaw.component.html',
  styleUrl: './seesaw.component.scss'
})
export class SeesawComponent extends ITensorflowSettings implements AfterViewInit {

  /** Accessing the canvas element */
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  cars: Car[] = [];

  data: Data[] = []

  constructor() {
    super()
  }

  ngAfterViewInit(): void {
    this.setScenario();
  }

  override settingTensorflow(): void {



    //  /** Map data to inputs */
    this.inputs = this.data?.map(d => [d.wheelAY, d.wheelBY]);

    //  /** Map data to labels */
    this.labels = this.data?.map(d => Number(d.action));

    /** TensorFlow settings */
    this.settings = {
      compiler: {
        optimizer: tf.train.adam(),
        loss: 'sparseCategoricalCrossentropy', // Use sparseCategoricalCrossentropy for multi-class classification
        metrics: ['accuracy']
      },


      fit: { batchSize: 5000, epochs: 15 },
      inputs: this.inputs,
      labels: this.labels,
      mainLayers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [2] }),
        tf.layers.dense({ units: 128, activation: 'relu', }),

      ],
      finalLayer: tf.layers.dense({ units: 3, activation: 'softmax' }),
    };
  }


  override setScenario(): void {

    // create renderer
    this.render = this.Render.create({
      canvas: this.canvas.nativeElement,
      engine: this.engine,
      options: {
        width: window.innerWidth - 10,
        height: window.innerHeight - 10,
        // showAngleIndicator: true,
        // showCollisions: true,
        showVelocity: true,
        showDebug: true,
        wireframes: false
      }
    });

  }

  draw() {

    this.Render.run(this.render);

    // create runner
    const runner = this.Runner.create();
    this.Runner.run(runner, this.engine);

    // add bodies
    const group = this.Body.nextGroup(true);

    const scale = 0.8;

    for (let car = 0; car < 5; car++) {

      const initialX = Math.round(Math.random() * window.innerWidth);
      const initialY = Math.round(Math.random() * (window.innerHeight / 2));
      this.cars.push(new Car(initialX, initialY, 150 * scale, 30 * scale, 30 * scale, this.model, `Car-${car}}`));
    }


    const catapult = this.Bodies.rectangle(window.innerWidth / 2, this.canvas.nativeElement.height - 150, window.innerWidth, 20, { render: { fillStyle: 'red' }, collisionFilter: { group: group }, });

    this.Composite.add(this.world, [
      ... this.cars.map(c => c.carComposite),

      // stack,
      catapult,

      this.Bodies.rectangle(100, this.canvas.nativeElement.height, 20, 20.5, { isStatic: true, render: { fillStyle: 'white' } }),
      this.Bodies.rectangle(window.innerWidth - 100, this.canvas.nativeElement.height, 20, 20.5, { isStatic: true, render: { fillStyle: 'white' } }),



      this.Constraint.create({
        bodyA: catapult,
        pointB: this.Vector.clone(catapult.position),
        stiffness: 1,
        length: 0
      })
    ]);

    // add mouse control
    const mouse = this.Mouse.create(this.render.canvas),
      mouseConstraint = this.MouseConstraint.create(this.engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });

    this.Composite.add(this.world, mouseConstraint);

    // keep the mouse in sync with rendering
    this.render.mouse = mouse;
    this.beforeUpdate(() => {
      this.cars.forEach(c => c.action())
    })
  }

  beforeUpdate(callback: Function) {
    Matter.Events.on(this.engine, 'beforeUpdate', (cb: any) => {
      callback(cb)
    });
  }

  override  createData() {
    this.data = []

    const dataA = [];
    const dataB = [];
    const dataC = [];

    // Loop through wheelA and wheelB
    for (let wheelA = -180; wheelA < 180; wheelA++) {
      for (let wheelB = -180; wheelB < 180; wheelB++) {
        if (wheelA > wheelB) {
          dataA.push({ action: Direction.right, wheelAY: wheelA, wheelBY: wheelB });
        } else if (wheelA < wheelB) {
          dataB.push({ action: Direction.left, wheelAY: wheelA, wheelBY: wheelB });
        }
      }
    }

    // Balance the number of data points for action 2
    let maxLength = Math.max(dataA.length, dataB.length);
    for (let i = 0; i < maxLength; i++) {
      let wheelA = (i % 360) - 180; // This will cycle through -180 to 179
      dataC.push({ action: 2, wheelAY: wheelA, wheelBY: wheelA });
    }

    // Combine all data
    let data = [...dataA, ...dataB, ...dataC];

    // Optional: Shuffle the data array to mix different action types
    data = data.sort(() => Math.random() - 0.5);


    this.data = data
  }

  /** Callback when the model is trained */
  modelTrainned(model: tf.Sequential) {
    this.model = model;
    this.draw()
  }
}
