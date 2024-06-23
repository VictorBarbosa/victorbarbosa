import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { TensorflowVisSampleComponent } from '../../common/tensorflow-visualization/tensorflow-visualization.component';
import { CommonModule } from '@angular/common';
import Matter from 'matter-js';
import { degreesToRadians, drawBody, drawLine, drawText, } from '../../common/common';
import { Scenario } from './scenario';
import Agent from './agent';
import { standardDeviation, train } from '../../algorithms/ARS/train';
import Policy from '../../algorithms/ARS/policy';
import HyperParameters from '../../algorithms/ARS/hyper-param';
import Normalizer from '../../algorithms/ARS/normalizer';
import p5 from 'p5';
import { radiansToDegrees } from "../../common/common";
import Main from '../../common/main';
import { explore } from '../../algorithms/ARS/explorer';
import * as tf from '@tensorflow/tfjs'
@Component({
  selector: 'app-star-ship-landing-super-vized',
  standalone: true,
  imports: [CommonModule, TensorflowVisSampleComponent],
  templateUrl: './starship-landing-super-vized.component.html',
  styleUrl: './starship-landing-super-vized.component.scss'
})
export class StarShipLandingSuperVizedComponent extends Main implements AfterViewInit {

  /** Accessing the canvas element */
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  /** TensorFlow settings */


  maxSpeedCollision = 0;

  agent!: Agent
  scenario!: Scenario


  ground!: Matter.Body

  policy!: Policy;
  hp!: HyperParameters
  normalizer!: Normalizer;
  bestReward = 0;

  model!: tf.GraphModel<string | tf.io.IOHandler>
  ngAfterViewInit(): void {

    tf.loadGraphModel('/assets/models/web_model/model.json').then(model => {
      this.model = model;
    })
    // this.draw();
    new p5(this.sketch.bind(this));
  }

  sketch(p: p5) {
    p.setup = () => this.setup(p);
    p.draw = () => this.draw(p);
  }

  setup(p: p5): void {
    p.createCanvas(this.width - 5, this.height - 5, this.canvas.nativeElement);

    // Ajustar a taxa de quadros para 5 fps
    p.frameRate(5);
    const img = p.loadImage('assets/starship.png');
    // Criação do motor de física
    this.engine = this.Engine.create();
    this.world = this.engine.world;


    // Criação de dois retângulos
    // this.boxA = this.Bodies.rectangle(200, 200, 80, 80);
    // this.boxB = this.Bodies.rectangle(400, 200, 80, 80);

    this.scenario = new Scenario(p, this.engine, this.canvas.nativeElement);
    this.agent = new Agent(p, this.scenario, img, (window.innerWidth / 2), 100);
    this.agent.setTargetPosition(this.scenario.landingPlatformX, this.scenario.landingPlatformY)
    this.Composite.add(this.engine.world, [this.agent.agentBody]);

    this.hp = new HyperParameters();

    this.policy = new Policy(this.agent.getState().length, this.agent.actionSpace, this.hp);
    this.normalizer = new Normalizer(this.agent.getState().length);
  }

  draw(p: p5): void {
    p.background(51);


    // Atualização do motor de física
    this.Engine.update(this.engine);

    // const deltas = this.policy.sampleDeltas();


    // let positiveRewards = new Array(this.hp.nbDirections).fill(0);
    // let negativeRewards = new Array(this.hp.nbDirections).fill(0);

    // for (let k = 0; k < this.hp.nbDirections; k++) {
    //   positiveRewards[k] = explore(this.agent, this.normalizer, this.policy, this.hp, 'positive', deltas[k]);
    // }

    // for (let k = 0; k < this.hp.nbDirections; k++) {
    //   negativeRewards[k] = explore(this.agent, this.normalizer, this.policy, this.hp, 'negative', deltas[k]);
    // }

    // let allRewards = positiveRewards.concat(negativeRewards);
    // let sigmaR = standardDeviation(allRewards);
    // sigmaR =(sigmaR !== 0 ? sigmaR : 0.001)
    // let scores: { [key: number]: number } = {};
    // positiveRewards.forEach((r, k) => scores[k] = Math.max(r, negativeRewards[k]));
    // let order = Object.keys(scores).map(Number).sort((a, b) => scores[b] - scores[a]).slice(0, this.hp.nbBestDirections);
    // let rollouts = order.map(k => [positiveRewards[k], negativeRewards[k], deltas[k]] as [number, number, number[][]]);

    // this.policy.update(rollouts, sigmaR);

    // let rewardEvaluation = explore(this.agent, this.normalizer, this.policy, this.hp,);


    // if (rewardEvaluation > this.bestReward) {
    //   this.bestReward = rewardEvaluation;

    //   console.log(`Best policy updated at step   with reward ${this.bestReward}`);
    // }


    if (this.model) {

      const { angle, agentX, targetX } = this.agent.getStateF();
      const input = tf.tensor([targetX, agentX, angle]).reshape([1, 3]); // Reshape to include batch dimension

      // Make predictions
      const prediction = this.model.predict(input) as tf.Tensor;;
      const action = (tf.argMax(prediction, 1) as any).arraySync()[0];
      this.agent.step(action)
 
    }


    // drawBody(p, this.ground)
    this.scenario.update();
    this.agent.update();



  }





}
