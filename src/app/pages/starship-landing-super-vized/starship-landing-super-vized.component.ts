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
import { BehaviorSubject, combineLatest, distinctUntilChanged, shareReplay, tap } from 'rxjs';
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

  // modelAngle!: 

  /*
   * ModelAngle
   */
  private readonly _modelAngle = new BehaviorSubject<tf.GraphModel<string | tf.io.IOHandler> | null>(null);
  modelAngle$ = this._modelAngle.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));
  get modelAngle(): tf.GraphModel<string | tf.io.IOHandler> | null {
    return this._modelAngle.getValue()
  }

  /*
   * HorizontalDirection
   */
  private readonly _horizontalDirection = new BehaviorSubject<tf.GraphModel<string | tf.io.IOHandler> | null>(null);
  horizontalDirection$ = this._horizontalDirection.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

  /*
  * HorizontalDirection getter
  */
  get horizontalDirection(): tf.GraphModel<string | tf.io.IOHandler> | null {
    return this._horizontalDirection.getValue();
  }



  /*
   * VerticalDirection
   */
  private readonly _verticalDirection = new BehaviorSubject<tf.GraphModel<string | tf.io.IOHandler> | null>(null);
  verticalDirection$ = this._verticalDirection.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

  /*
  * VerticalDirection getter
  */
  get verticalDirection(): tf.GraphModel<string | tf.io.IOHandler> | null {
    return this._verticalDirection.getValue();
  }

  /*
   * VerticalDirection
   */
  private readonly _combined = new BehaviorSubject<tf.GraphModel<string | tf.io.IOHandler> | null>(null);
  combined$ = this._combined.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

  /*
  * VerticalDirection getter
  */
  get combined(): tf.GraphModel<string | tf.io.IOHandler> | null {
    return this._combined.getValue();
  }



  ngAfterViewInit(): void {

    tf.loadGraphModel('assets/models/tf/angle/web_model/model.json').then(model => this._modelAngle.next(model));
    tf.loadGraphModel('assets/models/tf/horizontal_direction_datas/web_model/model.json').then(model => this._horizontalDirection.next(model));
    tf.loadGraphModel('assets/models/tf/vertical_direction_datas/web_model/model.json').then(model => this._verticalDirection.next(model));
    tf.loadGraphModel('assets/models/tf/angle/web_model_combined_data/model.json').then(model => this._combined.next(model));
    combineLatest([this.modelAngle$, this.horizontalDirection$, this.verticalDirection$, this.combined$]).pipe(tap(([modelAngle, horizontal, vertical, combined]) => {
      if (modelAngle && horizontal && vertical && combined) {

        new p5(this.sketch.bind(this));
      }
    })).subscribe();
    // // this.draw();

  }

  sketch(p: p5) {
    p.setup = () => this.setup(p);
    p.draw = () => this.draw(p);
  }

  setup(p: p5): void {
    p.createCanvas(this.width - 5, this.height - 5, this.canvas.nativeElement);

    // Ajustar a taxa de quadros para 5 fps
    p.frameRate(20);
    const img = p.loadImage('assets/starship.png');
    // Criação do motor de física
    this.engine = this.Engine.create({
      gravity: {
        x: 0,
        y: 1.625 / 9.8, // Lunar gravity is approximately 1.625 m/s²
        scale: 0.001
      }
    });
    this.world = this.engine.world;


    // Criação de dois retângulos
    // this.boxA = this.Bodies.rectangle(200, 200, 80, 80);
    // this.boxB = this.Bodies.rectangle(400, 200, 80, 80);

    this.scenario = new Scenario(p, this.engine, this.canvas.nativeElement);

    this.agent = new Agent(p, this.scenario, img, (window.innerWidth / 2), 100, {
      angle: this.modelAngle,
      horizontal: this.horizontalDirection,
      vertical: this.verticalDirection,
      combined: this.combined
    });
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

    // drawBody(p, this.ground)
    this.scenario.update();
    this.agent.update();

    this.agent.action()

  }





}
