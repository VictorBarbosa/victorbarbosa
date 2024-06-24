import Matter, { World } from "matter-js";

import Agent from './agent'
import Main from "../../common/main";
import { degreesToRadians, drawBody } from "../../common/common";
import p5 from "p5";
export class Scenario extends Main {
    lineTargetX: number = 0;
    lineTargetY: number = 0;

    landingPlatform!: Matter.Body;
    readonly category = 0x0002;

    runner!: Matter.Runner
    get landingPlatformY(): number {
        return this.landingPlatform.position.y;
    };

    get landingPlatformX(): number {
        return this.landingPlatform.position.x;
    };


    private readonly platformHeight = 15;
    private readonly platformWidth = 100


    /**
     *
     */
    constructor(private p: p5, engine: Matter.Engine, canvas: HTMLCanvasElement) {
        super();
        this.engine = engine;
        // create an engine
        // this.engine = this.Engine.create({
        //     enableSleeping: true,
        //     gravity: { scale: 0.001, x: 0, y: 0.1 }
        // });

        // this.Composite.add(this.world, [...agents.map(m => m.agentBody),]);
        // Criação de um chão
        // this.ground = this.Bodies.rectangle(this.width - (this.platformWidth / 2), this.height - (this.platformHeight / 2), this.platformWidth, this.platformHeight, { isStatic: true, angle: degreesToRadians(0), });

        // Criação de um chão
        // this.ground = this.Bodies.rectangle(0, this.height - 300, 200, 10, { isStatic: true });

        this.landingPlatform = this.addLandingPlatform();
        this.Composite.add(engine.world, this.landingPlatform);




        // Criar um objeto mouse
        const mouse = this.Mouse.create(canvas);
        const mouseConstraint = this.MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        // Adicionar o mouse constraint ao mundo
        this.World.add(this.engine.world, mouseConstraint);
    }

    private addLandingPlatform() {
        // this.lineTargetX = window.innerWidth / 2;
        this.lineTargetX = window.innerWidth / 1.5;
        this.lineTargetY = this.height - 20;
        return this.Bodies.rectangle(this.lineTargetX, this.lineTargetY, 75, 10, {
            collisionFilter: {
                category: this.category,
                mask: ~this.category,

            },
            isStatic: true, render: { fillStyle: 'pink' }
        });
    }

    update() {
        // this.agents.forEach(f => drawBody(this.p, f.agentBody));
        drawBody(this.p, this.landingPlatform)
    }
}