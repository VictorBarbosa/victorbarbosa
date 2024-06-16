import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { TensorflowVisSampleComponent } from '../../common/tensorflow-visualization/tensorflow-visualization.component';
import { CommonModule } from '@angular/common';
import { ITensorflowSettings } from '../../common/itensorflow-settings';
import Matter, { Body, Mouse, MouseConstraint, Vector, World } from 'matter-js';
import { degreesToRadians, drawLine, radiansToDegrees } from '../../common/common';
import * as tfvis from '@tensorflow/tfjs-vis';
interface State {
  angle: number;
  angularVelocity: number;
  positionX: number;
  positionY: number;
  velocityX: number;
  velocityY: number;
}

/** Enum for possible actions */
enum Action {
  LeftRotate,
  RightRotate,
  MainThrust,
  LeftThrust,
  RightThrust,
  Nothing,
}


@Component({
  selector: 'app-star-ship-landing-super-vized',
  standalone: true,
  imports: [CommonModule, TensorflowVisSampleComponent],
  templateUrl: './starship-landing-super-vized.component.html',
  styleUrl: './starship-landing-super-vized.component.scss'
})
export class StarShipLandingSuperVizedComponent extends ITensorflowSettings implements AfterViewInit {

  /** Accessing the canvas element */
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  /** TensorFlow settings */

  lineTargetX: number = 0;
  lineTargetY: number = 0;
  starShip!: Matter.Body;

  maxSpeedCollision = 0;
  landingPlatform!: Matter.Body;

  get starShipAngle(): number {
    return this.starShip.angle;
  }
  get starShipX(): number {
    return parseInt(this.starShip.position.x.toPrecision(3));
  }
  get starShipY(): number {
    return parseInt(this.starShip.position.y.toPrecision(3));
  }

  get landingPlatformY(): number {
    return parseInt(this.landingPlatform.position.y.toPrecision(3));
  };

  get landingPlatformX(): number {
    return parseInt(this.landingPlatform.position.x.toPrecision(3));
  };

  private getState(): State {
    return {
      angle: this.starShip.angle,
      angularVelocity: this.starShip.angularVelocity,
      positionX: this.starShip.position.x,
      positionY: this.starShip.position.y,
      velocityX: this.starShip.velocity.x,
      velocityY: this.starShip.velocity.y,
    };
  }
  private iteration: number = 0;
  modelStarship!: tf.Sequential
  constructor() { super(); }
  createData(): void { }
  setScenario(): void { }
  settingTensorflow() {
    this.initModel()
  }
  private initModel(): void {
    this.modelStarship = tf.sequential();
    this.modelStarship.add(tf.layers.dense({ units: 64, inputShape: [6], activation: 'relu' }));
    this.modelStarship.add(tf.layers.dense({ units: 256, activation: 'relu' }));
    this.modelStarship.add(tf.layers.dense({ units: 6, activation: 'softmax' })); // 6 saídas para as ações

    this.modelStarship.compile({ optimizer: tf.train.adam(0.001), loss: 'categoricalCrossentropy' });
  }

  ngAfterViewInit(): void {
    this.draw();

    // this.setupLossChart();
  }

  private setupLossChart(): void {
    const surface = tfvis.visor().surface({ name: 'Loss', tab: 'Charts' });

    // Configure a line chart on the surface
    const lossContainer = { name: 'Loss', tab: 'Charts' };
    const chart = tfvis.render.linechart(lossContainer, { values: [] }, {
      xLabel: 'Iteration',
      yLabel: 'Loss',
      width: 400,
      height: 300,
    });

    // surface.drawArea.appendChild(chart);
  }
  private updateLossChart(iteration: number, lossValue: number): void {
    const series = { values: [{ x: iteration, y: lossValue }] };
    const container = { name: 'Loss', tab: 'Charts' };
    tfvis.render.linechart(container, series);
  }
  draw() {

    // create an engine
    this.engine = this.Engine.create({ gravity: { scale: 0.001, x: 0, y: 0.1 } });

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

    // create two boxes and a ground
    this.starShip = this.addStarship();

    this.landingPlatform = this.addLandingPlatform();

    // const collision =  Matter.Collision.collides()
    // add all of the bodies to the world
    this.Composite.add(this.engine.world, [this.starShip, this.landingPlatform,
    this.Bodies.rectangle(window.innerWidth - 105, this.height - 35, 2, 20, { render: { fillStyle: 'red' } }),
    this.Bodies.rectangle(window.innerWidth - 45, this.height - 35, 2, 20, { render: { fillStyle: 'yellow' } }),

    ]);
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
      drawLine(this.render.context, this.starShipX, this.starShipY, this.lineTargetX, this.lineTargetY);

      this.updateEnvironment();
    });
  }

  addStarship(): Matter.Body {
    const body = this.Bodies.rectangle((window.innerWidth / 2) + 300, 500, 12, 25, {
      angle: degreesToRadians(0),
      render: {
        sprite: {
          texture: 'assets/starship.png', // Replace with the path to your image
          xScale: 2 / 100, // Adjust these to fit your sprite size
          yScale: 2 / 100
        },
      }
    });

    return body;
  }

  rotateLeft() {
    this.starShip.angle -= 0.01;
  }
  rotateRight() {
    this.starShip.angle += 0.01;
  }

  applyMainThruster(body: Body, forceMagnitude: number) {
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
    this.lineTargetX = window.innerWidth - 75;
    this.lineTargetY = this.height - 20;
    return this.Bodies.rectangle(window.innerWidth - 75, this.height - 20, 150, 10, { isStatic: true, render: { fillStyle: 'white' } });
  }

  beforeUpdate(callback: Function) {
    Matter.Events.on(this.engine, 'beforeUpdate', (cb: any) => {
      callback(cb);
    });
  }

  afterUpdate(callback: Function) {
    Matter.Events.on(this.engine, 'afterUpdate', (cb: any) => {
      callback(cb);
    });
  }

  calculateDistance() {
    const deltaX = this.starShipX - this.landingPlatformX;
    const deltaY = this.starShipY - this.landingPlatformY;
    const result = Vector.magnitude({ x: deltaX, y: deltaY }) - 68;
    return result < 5 ? 0 : result;
  }

  calculateReward(state: State) {

    let reward = 0;

    const distanceToTarget = Math.sqrt((state.positionX - this.lineTargetX) ** 2 + (state.positionY - this.lineTargetY) ** 2);
    reward -= distanceToTarget;

    // const speed = Math.sqrt(state.velocityX ** 2 + state.velocityY ** 2);
    // reward -= speed;

    // const angleError = Math.abs(state.angle);
    // reward -= angleError;

    // if (distanceToTarget < 1 && speed < 0.1 && angleError < 0.1) {
    //   reward += 1000;
    // }


    if (distanceToTarget < 1) {
      reward += 1000;
    }

    return reward;
  }

  private checkIfLanded(state: State): boolean {
    if (state.positionX < 0 || state.positionX > window.innerWidth || state.positionY < 0 || state.positionY > window.innerHeight) {
      return true;
    }

    const distanceToTarget = Math.sqrt((state.positionX - this.lineTargetX) ** 2 + (state.positionY - this.lineTargetY) ** 2);
    const speed = Math.sqrt(state.velocityX ** 2 + state.velocityY ** 2);
    const angleError = Math.abs(state.angle);

    return distanceToTarget < 1 && speed < 0.1 && angleError < 0.1;
  }

  resetEnvironment() {
    // Reiniciar a posição da nave e outras configurações do ambiente
    Body.setPosition(this.starShip, { x: (window.innerWidth / 2) + 300, y: 500 });
    Body.setVelocity(this.starShip, { x: 0, y: 0 });
    Body.setAngle(this.starShip, 0);
    Body.setAngularVelocity(this.starShip, 0);
  }

  applyAction(action: Action) {
    switch (action) {
      // case Action.LeftRotate:
      //   this.rotateLeft();
      //   break;
      // case Action.RightRotate:
      //   this.rotateRight();
      //   break;
      case Action.MainThrust:
        this.applyMainThruster(this.starShip, 0.0005);
        break;
      case Action.LeftThrust:
        Body.applyForce(this.starShip, { x: this.starShip.position.x, y: this.starShip.position.y }, { x: -0.01, y: 0 });
        break;
      case Action.RightThrust:
        Body.applyForce(this.starShip, { x: this.starShip.position.x, y: this.starShip.position.y }, { x: 0.01, y: 0 });
        break;
      case Action.Nothing:
      default:
        // Nenhuma ação
        break;
    }
  }

  updateEnvironment() {
    // // Atualizar a física do Matter.js
    // Matter.Engine.update(this.engine);

    // Calcular o novo estado
    const state = this.getState();

    // Selecionar a próxima ação usando o modelo PPO
    const action = this.selectAction(state);

    // Aplicar a ação ao ambiente
    this.applyAction(action);

    // Calcular a recompensa
    const reward = this.calculateReward(state);
    console.log("reward", reward)
    // Atualizar o modelo PPO
    this.updatePPO(state, action, reward, this.iteration);

    // Verificar condições de término do episódio
    if (this.checkIfLanded(state)) {
      // this.iteration++;
      this.resetEnvironment();
    }
  }

  // const numberOfActions = Object.keys(Action).filter((key: any) => !isNaN(Number(Action[key]))).length;

  private updatePPO(state: State, action: Action, reward: number, iteration: number): void {
    const currentStateTensor = tf.tensor([[state.angle, state.angularVelocity, state.positionX, state.positionY, state.velocityX, state.velocityY]]);
    const optimizer = tf.train.adam(0.001);

    optimizer.minimize((): any => {
      const actionProbabilities = this.modelStarship.predict(currentStateTensor) as tf.Tensor;
      const advantage = tf.scalar(reward);
      const logits = this.modelStarship.apply(currentStateTensor) as tf.Tensor;
      const actionLogProbs = tf.logSoftmax(logits).gather([action], 1);

      const ratio = tf.exp(actionLogProbs).div(actionProbabilities);
      const minAdv = tf.mul(ratio, advantage);
      const maxAdv = tf.mul(tf.clipByValue(ratio, 1 - 0.2, 1 + 0.2), advantage);
      const clipped = tf.minimum(minAdv, maxAdv);
      const loss = tf.mul(clipped, -1).mean();


      // // Update loss chart
      // this.updateLossChart(iteration, loss as any);

      tf.dispose(currentStateTensor);
      tf.dispose(actionProbabilities);
      tf.dispose(logits);
      tf.dispose(actionLogProbs);



      return loss;
    });
  }

  private selectAction(state: State): Action {
    const currentStateTensor = tf.tensor([[state.angle, state.angularVelocity, state.positionX, state.positionY, state.velocityX, state.velocityY]]);
    const actionProbabilities = this.modelStarship.predict(currentStateTensor) as tf.Tensor;

    const actionIndex = actionProbabilities.argMax(1).dataSync()[0];
    tf.dispose(currentStateTensor);
    tf.dispose(actionProbabilities);

    return actionIndex as Action;
  }


  /** Callback when the modelStarship is trained */
  modelTrainned(modelStarship: tf.Sequential) {
    this.modelStarship = modelStarship;
  }
}
