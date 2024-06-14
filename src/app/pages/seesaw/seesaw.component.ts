import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ITensorflowSettings } from '../../common/itensorflow-settings';
import Matter from 'matter-js';
import Car from './car';
import * as tf from '@tensorflow/tfjs';
import { TensorflowVisSampleComponent } from '../../common/tensorflow-visualization/tensorflow-visualization.component';
import { CommonModule } from '@angular/common';
import { radiansToDegrees } from '../../common/common'
enum Direction {
  left = 0,
  right = 1,
  nothing = 2
}
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
  ngAfterViewInit(): void {
    this.setScenario();
  }


  /** Accessing the canvas element */
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;


  car!: Car;
  data: Data[] = []
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
    this.car = new Car((window.innerWidth / 2), this.canvas.nativeElement.height - 250, 150 * scale, 30 * scale, 30 * scale)
    const catapult = this.Bodies.rectangle(window.innerWidth / 2, this.canvas.nativeElement.height - 200, window.innerWidth / 2, 20, { render: { fillStyle: 'red' }, collisionFilter: { group: group }, });

    //  this. car = this.car((window.innerWidth / 2) - 150, 100, 150 * scale, 30 * scale, 30 * scale);

    this.Composite.add(this.world, [
      this.car.carComposite,
      // stack,
      catapult,
      this.Bodies.rectangle(window.innerWidth / 2, this.canvas.nativeElement.height, window.innerWidth, 20.5, { isStatic: true, render: { fillStyle: 'white' } }),

      // this.Bodies.circle(560, 100, 50, { density: 0.005, position: { x: 100, y: 0 } }),
      // this.Bodies.circle(560, 100, 50, { density: 0.005 }),
      // see car function defined later in this file


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
      const prediction = this.model?.predict(tf.tensor([[this.car.wheelA.position.y, this.car.wheelB.position.y,]])) as tf.Tensor;


      // Use tf.argMax para obter o índice da classe prevista
      const classIdTensor = tf.argMax(prediction, 1);
      const classIdArray = classIdTensor.arraySync() as any;
      const classId = classIdArray[0]; // Como temos apenas uma amostra, pegamos o primeiro valor

      switch (classId) {
        case Direction.left: this.car.goLeft(); break;
        case Direction.right: this.car.goRight(); break;

        default:
          break;
      }
      console.log("***Direction***", Direction[classId])

    })
  }

  beforeUpdate(callback: Function) {
    Matter.Events.on(this.engine, 'beforeUpdate', (cb: any) => {
      callback(cb)
    });
  }

  override  createData() {
    this.data = []




    let dataA = [];
    let dataB = [];
    let dataC = [];

    // Loop through wheelA and wheelB
    for (let wheelA = -180; wheelA < 180; wheelA++) {
      for (let wheelB = -180; wheelB < 180; wheelB++) {
        if (wheelA > wheelB) {
          dataA.push({ action: 1, wheelAY: wheelA, wheelBY: wheelB });
        } else if (wheelA < wheelB) {
          dataB.push({ action: 0, wheelAY: wheelA, wheelBY: wheelB });
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



    // for (let wheelA = -180; wheelA < 180; wheelA++) {
    //   for (let wheelB = -180; wheelB < 180; wheelB++) {

    //     // if ((wheelA > -5 && wheelA < 5) && (wheelB > -5 && wheelB < 5)) {
    //     //   this.data.push({ action: Direction.nothing, wheelAY: wheelA, wheelBY: wheelB })
    //     // }
    //     // else 
    //     if (wheelA > wheelB) {
    //       this.data.push({ action: Direction.left, wheelAY: wheelA, wheelBY: wheelB })
    //     }
    //     else if (wheelA < wheelB) {
    //       this.data.push({ action: Direction.right, wheelAY: wheelA, wheelBY: wheelB })
    //     }
    //     else {
    //       this.data.push({ action: Direction.nothing, wheelAY: wheelA, wheelBY: wheelB })
    //     }

    //   }

    // }

  }

  /** Callback when the model is trained */
  modelTrainned(model: tf.Sequential) {
    this.model = model;
    this.draw()
  }
}
