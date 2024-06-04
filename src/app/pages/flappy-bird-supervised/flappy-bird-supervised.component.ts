import { Component, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';
import { TensorflowVisSampleComponent } from '../tensorflow-visualization/tensorflow-visualization.component';
import { CommonModule } from '@angular/common';
import { TensorflowSettings } from '../../common/tensorflow-settings';
import * as tf from '@tensorflow/tfjs';
import * as m from 'matter-js'
import Matter from 'matter-js';
import { BehaviorSubject, distinctUntilChanged, shareReplay } from 'rxjs';
/** Enum for possible actions */
enum Action {
  Nothing = 0,
  Jump = 1
}

/** Interface for data structure */
interface Data {
  yTarget: number,
  yAgent: number,
  action: Action
}

/** Component metadata */
@Component({
  selector: 'app-flappy-bird-supervised',
  standalone: true,
  imports: [CommonModule, TensorflowVisSampleComponent],
  templateUrl: './flappy-bird-supervised.component.html',
  styleUrls: ['./flappy-bird-supervised.component.scss']
})
export class FlappyBirdSupervisedComponent implements OnInit {
  /** Screen height */
  readonly screenYSize: number = window.innerHeight;

  /** Array to hold training data */
  data: Data[] = [];

  /** Input data for the model */
  inputs: number[][] = [];

  /** Labels for the model */
  labels: number[] = [];

  /** TensorFlow settings */
  settings!: TensorflowSettings;


  /*
   * Model
   */
  private readonly _model = new BehaviorSubject<tf.Sequential | null>(null);
  model$ = this._model.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

  /*
  * Model getter
  */
  get model(): tf.Sequential | null {
    return this._model.getValue();
  }

  /*
   * Model setter
   */
  set model(value: tf.Sequential | null) {
    if (this._model.getValue() !== value) {
      this._model.next(value);
    }
  }

  /** Accessing the canvas element */
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;


  private engine!: Matter.Engine;
  private render!: Matter.Render;
  private bird!: Matter.Body;
  private ground!: Matter.Body;
  private obstacles: Matter.Body[] = [];
  private target: Matter.Body[] = [];
  private obstacleFrequency: number = 1500; // milliseconds
  nextYellowPointX: number = 0; // Variável para armazenar a coordenada X do ponto amarelo em relação à ave
  birdX: number = 0; // Variável para armazenar a coordenada X da ave

  constructor() {


    /** Create training data */
    const json = this.creatingDataToTraining();
    this.settingTensorflow();

  }

  ngOnInit(): void {
    this.canvas
    this._model.subscribe((m) => {


      if (m) {

        this.initMatterJS();
        this.createBird();
        this.createGround();
        this.createObstacles();
        this.startGame();
      }

    })
  }

  private initMatterJS() {
    this.engine = Matter.Engine.create();
    this.render = Matter.Render.create({
      canvas: this.canvas.nativeElement,
      engine: this.engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#87CEEB'
      }
    });

    Matter.Render.run(this.render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, this.engine);
  }

  private createBird() {
    this.bird = Matter.Bodies.rectangle(100, window.innerHeight / 2, 40, 40, {
      render: {
        fillStyle: 'yellow'
      }
    });
    Matter.World.add(this.engine.world, this.bird);
  }

  private createGround() {
    this.ground = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 20, window.innerWidth, 40, {
      isStatic: true,
      render: {
        fillStyle: 'green'
      }
    });
    Matter.World.add(this.engine.world, this.ground);
  }



  private createObstacles() {
    const initialX = window.innerWidth + 100;
    const spaceBetweenObstacles = 200;
    const obstacleWidth = 80;
    const gapHeight = 120; // Altura da abertura entre os canos
    const topHeight = Math.random() * (window.innerHeight - gapHeight);
    const bottomHeight = window.innerHeight - topHeight - gapHeight;

    const topObstacle = Matter.Bodies.rectangle(initialX, topHeight / 2, obstacleWidth, topHeight, {
      isStatic: true,
      render: {
        fillStyle: 'brown'
      }
    });

    const bottomObstacle = Matter.Bodies.rectangle(initialX, window.innerHeight - bottomHeight / 2, obstacleWidth, bottomHeight, {
      isStatic: true,
      render: {
        fillStyle: 'brown'
      }
    });

    const gapCenterY = (topHeight + 100); // Posição Y do centro do vão
    const circle = Matter.Bodies.circle(initialX, gapCenterY, 5, { // Posicionando o círculo no centro do vão
      isStatic: true,
      render: {
        fillStyle: 'yellow'
      }
    });

    this.obstacles.push(topObstacle);
    this.obstacles.push(bottomObstacle);
    this.obstacles.push(circle); // Adiciona o círculo entre os canos
    this.target.push(circle); // Adiciona o círculo entre os canos

    Matter.World.add(this.engine.world, this.obstacles);
  }

  private startGame() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      pairs.forEach(pair => {
        // Verifica se o par de corpos envolve o pássaro e o ponto amarelo
        if ((pair.bodyA === this.bird && pair.bodyB === this.obstacles[2]) ||
          (pair.bodyB === this.bird && pair.bodyA === this.obstacles[2])) {
          // Se sim, ignora a colisão
          pair.isActive = false;
        } else if (pair.bodyA === this.bird || pair.bodyB === this.bird) {
          // Se não, e se envolver o pássaro com outro objeto, encerra o jogo
          alert("Game over")
          window.location.reload();
        }
      });
    });

    Matter.Events.on(this.engine, 'beforeUpdate', () => {
      this.obstacles.forEach((obstacle) => {
        Matter.Body.translate(obstacle, { x: -2, y: 0 }); // Move os obstáculos para a esquerda
        if (obstacle.position.x < -80) {
          // Remove os obstáculos que saíram da tela
          Matter.Composite.remove(this.engine.world, obstacle);
        }

        this.birdX = this.bird.position.y;
        // Encontra o próximo ponto amarelo em relação à ave


        this.nextYellowPointX = obstacle.position.y;

        const inputs = tf.tensor([[this.birdX, this.nextYellowPointX]]); // Cria um tensor com as entradas



        const classes = ["Nothing", "JUMP",];


        const prediction = this.model?.predict(inputs) as tf.Tensor
        const arg = (prediction.argMax(1) as any).arraySync()[0] as number

        const decision = classes[arg]

        if (decision === "JUMP") {
          Matter.Body.setVelocity(this.bird, { x: 0, y: -4 });
        }
        console.log(decision)
        return;


      });


      // Faz a previsão usando o modelo


      // Adiciona novos obstáculos quando necessário
      if (this.obstacles[this.obstacles.length - 1].position.x < window.innerWidth - 400) {
        this.createObstacles();
      }
    });


  }

  @HostListener('window:keydown.space', ['$event'])
  handleSpace(event: KeyboardEvent) {
    if (event.code === 'Space') {
      Matter.Body.setVelocity(this.bird, { x: 0, y: -4 });
    }
  }

  settingTensorflow() {
    /** Map data to inputs */
    this.inputs = this.data.map(d => [d.yAgent, d.yTarget]);

    /** Map data to labels */
    this.labels = this.data.map(d => Number(d.action));

    /** TensorFlow settings */
    this.settings = {
      compiler: {
        optimizer: tf.train.adam(),
        loss: 'sparseCategoricalCrossentropy', // Use sparseCategoricalCrossentropy for multi-class classification
        metrics: ['accuracy']
      },

      fit: { batchSize: 128, epochs: 10 },
      inputs: this.inputs,
      labels: this.labels,
      mainLayers: [tf.layers.dense({ units: 10, activation: 'relu', inputShape: [2] })],
      finalLayer: tf.layers.dense({ units: 2, activation: 'softmax' }),
    };
  }

  /** Function to create training data */
  creatingDataToTraining() {
    for (let target = 0; target < this.screenYSize; target += 10) {
      for (let agent = 0; agent < this.screenYSize; agent += 10) {
        if (agent < target) {
          this.data.push({ yAgent: agent, yTarget: target, action: Action.Nothing });
        } else {
          this.data.push({ yAgent: agent, yTarget: target, action: Action.Jump });
        }
      }
    }
    return JSON.stringify(this.data);
  }

  /** Callback when the model is trained */
  modelTrainned(model: tf.Sequential) {
    this.model = model;
  }
}
