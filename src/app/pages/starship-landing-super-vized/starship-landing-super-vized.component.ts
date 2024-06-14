import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { TensorflowSettings } from '../../common/tensorflow-settings';
import * as tf from '@tensorflow/tfjs';
import { TensorflowVisSampleComponent } from '../../common/tensorflow-visualization/tensorflow-visualization.component';
import { CommonModule } from '@angular/common';
import { ITensorflowSettings } from '../../common/itensorflow-settings';
import Matter, { Body, Mouse, MouseConstraint, Vector, World } from 'matter-js';
import { BehaviorSubject, distinctUntilChanged, shareReplay, tap } from 'rxjs';
import { degreesToRadians, radiansToDegrees } from '../../common/common';



/** Enum for possible actions */
enum Action {
  NoRotate = 0,
  LeftRotate = 1,
  RightRotate = 2,
  // Thrust = 3,
  // Nothing = 4
}

interface Position {
  x: number
  y: number
  angle: number
}
/** Interface for data structure */
interface Data {
  // yTarget: Position,
  Agent: Position,
  action: Action;

}

@Component({
  selector: 'app-star-ship-landing-super-vized',
  standalone: true,
  imports: [CommonModule, TensorflowVisSampleComponent],
  templateUrl: './starship-landing-super-vized.component.html',
  styleUrl: './starship-landing-super-vized.component.scss'
})
export class StarShipLandingSuperVizedComponent extends ITensorflowSettings implements AfterViewInit {
  override createData(): void {
    throw new Error('Method not implemented.');
  }

  /** Accessing the canvas element */
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;


  /** TensorFlow settings */


  /** Array to hold training data */
  data: Data[] = [];

  starShip!: Matter.Body;
  maxSpeedCollision = 0;
  landingPlatform!: Matter.Body;
  lauchingPlatform!: Matter.Body;

  get starShipAngle(): number {
    return this.starShip.angle;
  }
  get starShipX(): number {
    return parseInt(this.starShip.position.x.toPrecision(3))
  }
  get starShipY(): number {
    return parseInt(this.starShip.position.y.toPrecision(3))
  }

  get landingPlatformY(): number {
    return parseInt(this.landingPlatform.position.y.toPrecision(3))
  };

  get landingPlatformX(): number {
    return parseInt(this.landingPlatform.position.x.toPrecision(3))
  };


  constructor() {
    super()

  }
  override setScenario(): void {
    tf.loadLayersModel("assets/model/startship_landing_model.json").then(model => {

      if (model) {

        this._model.next(model)
      } else {
        this.dataBuilder()
        this.settingTensorflow();
      }
    })

    this.model$.pipe(tap(model => {
      if (model) {


        this.draw()
      }
    })).subscribe()
  }

  ngAfterViewInit(): void {
    // this.draw()
  }

  dataBuilder() {
    for (let angle = -180; angle < 180; angle++) {
      for (let x = 0; x < this.width / 10; x++) {
        for (let y = 0; y < this.height / 10; y++) {
          if (angle < 5) {
            this.data.push({ Agent: { angle, x, y }, action: Action.RightRotate })
          } else if (angle > 5) {
            this.data.push({ Agent: { angle, x, y }, action: Action.LeftRotate })
          }
          this.data.push({ Agent: { angle: 0, x: 0, y: 0 }, action: Action.NoRotate })
        }
      }
    }
  }

  settingTensorflow() {

    // Mapear os dados para entradas e rótulos
    this.inputs = [];
    this.labels = [];

    this.data.forEach(d => {
      this.inputs.push([d.Agent.angle]);
      this.labels.push(Number(d.action));
    });


    /** TensorFlow settings */
    this.settings = {
      compiler: {
        optimizer: tf.train.adam(),
        loss: 'sparseCategoricalCrossentropy', // Use sparseCategoricalCrossentropy for multi-class classification
        metrics: ['accuracy']
      },

      fit: { batchSize: 10000, epochs: 3 },
      inputs: this.inputs,
      labels: this.labels,
      mainLayers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }),
      ],
      finalLayer: tf.layers.dense({ units: 3, activation: 'softmax' }),
    };

  }

  draw() {
    // module aliases

    // create an engine
    this.engine = this.Engine.create({ gravity: { scale: 0.001, x: 0, y: 0.1 } });

    // create a renderer
    this.render = this.Render.create({
      canvas: this.canvas.nativeElement,
      engine: this.engine,
      options: {
        showDebug: true,
        wireframes: false
      }
    });

    // create two boxes and a ground
    this.starShip = this.addStarship()

    this.lauchingPlatform = this.addLauchingPlatform()
    this.landingPlatform = this.addLandingPlatform()

    // const collision =  Matter.Collision.collides()
    // add all of the bodies to the world
    this.Composite.add(this.engine.world, [this.starShip, this.lauchingPlatform, this.landingPlatform]);
    // Criar um objeto mouse
    const mouse = Mouse.create(this.render.canvas);
    const mouseConstraint = MouseConstraint.create(this.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });

    // Adicionar o mouse constraint ao mundo
    World.add(this.engine.world, mouseConstraint);

    // run the renderer
    this.Render.run(this.render);

    // create runner
    const runner = this.Runner.create();
    // run the engine
    this.Runner.run(runner, this.engine);

    this.afterUpdate(() => {
      const degree = radiansToDegrees(this.starShipAngle);
      // Matter.Collision.create(this.starShip,this.lauchingPlatform)
      const isOnGround = Matter.Collision.collides(this.starShip, this.lauchingPlatform)


      if (this.model && !isOnGround) {

        const inputs = tf.tensor([degree]); // Cria um tensor com as entradas
        // debugger
        const prediction = this.model?.predict(inputs) as tf.Tensor;

        // Use tf.argMax para obter o índice da classe prevista
        const classIdTensor = tf.argMax(prediction, 1);
        const classIdArray = classIdTensor.arraySync() as any;
        const classId = classIdArray[0]; // Como temos apenas uma amostra, pegamos o primeiro valor

        const classes = ["RightRotate", "LeftRotate", "Thrust", "Nothing", "NoRotate"];

        console.log("******", Action[classId])


        switch (Action[classId]) {
          case "RightRotate": this.rotateRight(); break;
          case "LeftRotate": this.rotateLeft(); break;

          default:
            break;
        }
        // if (this.maxSpeedCollision < this.starShip.speed) {
        //   this.maxSpeedCollision = this.starShip.speed

        // }
        // console.log("Distance :", this.calculateDistance())
        // console.log("angle :", this.starShip.angle)
        // console.log("maxSpeedCollision :", this.maxSpeedCollision)

        if (this.starShipY > 500) {
          // this.starShip.position.y -= 1

          // this.starShip.force.y -= 0.01
          // this.starShip.angle += 0.01
          // this.applyThrust(this.starShip, 0.0005)
        }
        // else if (this.starShipY > 500 && this.starShipX < 500) {
        //   this.starShip.angle = 50
        //   this.applyThrust(this.starShip, 0.009)
        // }

      }
    })
  }
  addStarship(): Matter.Body {

    const body = this.Bodies.rectangle(100, 90, 12, 25, {
      angle: degreesToRadians(45),
      render: {
        sprite: {
          texture: 'assets/starship.png', // Replace with the path to your image
          xScale: 2 / 100, // Adjust these to fit your sprite size
          yScale: 2 / 100
        },
      }
    });

    return body
  }

  rotateLeft() {
    this.starShip.angle -= 0.01;
  }
  rotateRight() {
    this.starShip.angle += 0.01;
  }

  applyThrust(body: Body, forceMagnitude: number) {

    const angle = body.angle;
    const force = {
      x: Math.sin(angle) * forceMagnitude,
      y: -Math.cos(angle) * forceMagnitude
    };
    Body.applyForce(body, { x: body.position.x, y: body.position.y }, force);
  }



  addLauchingPlatform() {
    return this.Bodies.rectangle(0, this.height - 50, 600, 60, { isStatic: true, render: { fillStyle: 'white' } });
  }

  addLandingPlatform() {
    return this.Bodies.rectangle(780, this.height - 50, 100, 60, { isStatic: true, render: { fillStyle: 'white' } });
  }

  beforeUpdate(callback: Function) {
    Matter.Events.on(this.engine, 'beforeUpdate', (cb: any) => {
      callback(cb)
    });
  }

  afterUpdate(callback: Function) {
    Matter.Events.on(this.engine, 'afterUpdate', (cb: any) => {
      callback(cb)
    });
  }

  calculateDistance() {
    const deltaX = this.starShipX - this.landingPlatformX;
    const deltaY = this.starShipY - this.landingPlatformY;
    const result = Vector.magnitude({ x: deltaX, y: deltaY }) - 68;
    return result < 5 ? 0 : result;
  }

  /** Callback when the model is trained */
  modelTrainned(model: tf.Sequential) {
    this.model = model;
  }
}
