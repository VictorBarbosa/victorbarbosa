import Matter from "matter-js";
import { degreesToRadians, drawBody, drawLine, radiansToDegrees } from "../../common/common";
import p5 from "p5";
import Main from "../../common/main";
import { Scenario } from "./scenario";
interface State {
    angle: number;
    agentX: number;
    targetX: number

}

/** Enum for possible actions */
enum Action {
    Nothing = 0,
    LeftThrust = 1,
    MainThrust = 2,
    RightThrust = 3,
    // LeftRotate = 4,
    // RightRotate = 5,
}

export default class Agent extends Main {
    done: boolean = false;
    private score: number = 0;
    readonly maxFuel: number = 1000;
    readonly category: number = 0x0001;
    agentBody!: Matter.Body;
    targetX: number = 0;
    targetY: number = 0;
    fuel = this.maxFuel;

    readonly actionSpace = 4;
    readonly observationSpace = 7
    public get percentFuel(): number {
        return parseFloat((this.fuel / this.maxFuel * 100).toFixed(2));
    }
    public get getColorForPercentage(): string {
        if (this.percentFuel >= 60 && this.percentFuel <= 100) {
            return 'green';
        } else if (this.percentFuel >= 30 && this.percentFuel <= 59) {
            return 'yellow'; // I think you meant yellow instead of orange
        } else if (this.percentFuel > 10 && this.percentFuel < 30) {
            return 'orange'; // or yellow, depending on the desired behavior
        }
        return 'red'; // default color for when the fuel is 0 or negative
    }
    get agentAngle(): number {
        return this.agentBody.angle;
    }
    get agentX(): number {
        return this.agentBody.position.x;
    }
    get agentY(): number {
        return this.agentBody.position.y;
    }
    get distance(): number {
        const deltaX = this.agentX - this.targetX;
        const deltaY = this.agentY - this.targetY;
        return parseFloat((this.Vector.magnitude({ x: deltaX, y: deltaY + 17.45 })).toFixed(2));
    }
    get angle(): number {
        return parseFloat((radiansToDegrees(this.agentBody.angle)).toFixed(2));
    }
    get speed(): number {
        return parseFloat((this.agentBody.speed).toFixed(2));
    }
    get angularSpeed(): number {
        return parseFloat((this.agentBody.angularSpeed).toFixed(2));
    }
    get angularVelocity(): number {
        return parseFloat((this.agentBody.angularVelocity).toFixed(2));
    }

    get totalActions() {
        return Object.keys(Action).length / 2;
    }
    getStateF(): State {
        return {
            angle: this.angle,
            agentX: this.agentX,
            targetX: this.targetX

        };
    }
    getState(): number[] {
        return [
            // this.angle,
            // this.speed,
            // this.agentBody.position.x,
            // this.agentBody.position.y,
            // this.agentBody.velocity.x,
            // this.agentBody.velocity.y,
            this.agentX,
            this.agentY,
            this.targetX,
            this.targetY,
            // this.fuel
        ]
    }
    constructor(private p: p5, private scenario: Scenario, private img: p5.Image, private x: number, private y: number) {
        super()
        this.agentBody = this.addStarship();
    }

    update() {
        this.p.push();
        this.p.stroke('red')
        this.p.line(this.agentX, this.agentY, this.targetX, this.targetY);
        this.p.pop();
        drawBody(this.p, this.agentBody);
        drawBody(this.p, this.agentBody, this.img);
        this.p.push();


        this.p.push();
        this.p.fill('white')



        this.p.text(`Fuel ${this.percentFuel}% `, this.agentX + 10, this.agentY - 10)
        this.p.text(`Distance ${this.distance} `, this.agentX + 10, this.agentY)
        this.p.text(`Angle ${this.angle} `, this.agentX + 10, this.agentY + 10)
        this.p.text(`Velocity ${this.speed} `, this.agentX + 10, this.agentY + 20)
        this.p.pop();

        this.checkIsAlive();
    }


    setTargetPosition(landingPlatformX: number, landingPlatformY: number) {
        this.targetX = landingPlatformX;
        this.targetY = landingPlatformY;
    }

    private addStarship(): Matter.Body {
        return this.Bodies.rectangle(this.x / 2, this.y, 22, 25, {
            angle: degreesToRadians(30),
            isStatic: false,
            collisionFilter: {
                // category: this.category,
                // mask: ~this.category,
            },
            // render: {
            //     // sprite: {
            //     //     texture: 'assets/starship.png', // Replace with the path to your image
            //     //     xScale: 2 / 100, // Adjust these to fit your sprite size
            //     //     yScale: 50 / 100
            //     // },
            // }
        });
    }
    private rotateLeft() {
        this.agentBody.angle -= 0.001;
    }
    private rotateRight() {
        this.agentBody.angle += 0.001;
    }
    resetEnvironment() {
        this.Body.setPosition(this.agentBody, { x: this.x, y: this.y });
        this.Body.setVelocity(this.agentBody, { x: 0, y: 0 });
        this.Body.setAngle(this.agentBody, 0);
        this.Body.setAngularVelocity(this.agentBody, 0);
        this.agentBody.render.visible = true;
        this.fuel = 1000;
        this.done = false;
        return { _state: this.getState(), reward: this.score, terminade: this.done }
    }

    /**
     * # Action
# 0 Nothing
# 1 Go Left 
# 2 Go Right
# 3 RoteteLeft
# 4 RotateRight
# 5 TurnOnEngine
     * @param action 
     */
    private applyAction(action: number) {

        switch (action) {
       /* 0 Nothing      */case 0: break;
       /* 1 Go Left      */ case 1: this.Body.applyForce(this.agentBody, { x: this.agentBody.position.x, y: this.agentBody.position.y }, { x: -0.0001, y: 0 }); break;
       /* 2 Go Right     */ case 2: this.Body.applyForce(this.agentBody, { x: this.agentBody.position.x, y: this.agentBody.position.y }, { x: 0.0001, y: 0 }); break;
       /* 3 RoteteLeft   */case 3: this.rotateLeft(); break;
       /* 4 RotateRight  */ case 4: this.rotateRight(); break;
       /* 5 TurnOnEngine */  case 5: this.applyMainThruster(this.agentBody, 0.0005); break;


        }
        // switch (Action[action]) {
        //     case Action[0]: break;//Nothing;
        //     case Action[1]://LeftThrust
        //         this.Body.applyForce(this.agentBody, { x: this.agentBody.position.x, y: this.agentBody.position.y }, { x: -0.0001, y: 0 });
        //         break;
        //     case Action[2]://MainThrust
        //         this.applyMainThruster(this.agentBody, 0.0005);
        //         break;
        //     case Action[3]://RightThrust
        //         this.Body.applyForce(this.agentBody, { x: this.agentBody.position.x, y: this.agentBody.position.y }, { x: 0.0001, y: 0 });
        //         break;
        //     default:
        //         // Nenhuma ação
        //         break;
        // }
    }

    private applyMainThruster(body: Matter.Body, forceMagnitude: number) {
        const angle = body.angle;
        const force = {
            x: Math.sin(angle) * forceMagnitude,
            y: -Math.cos(angle) * forceMagnitude
        };
        this.Body.applyForce(body, { x: body.position.x, y: body.position.y }, force);
    }

    checkIsAlive() {
        const collision = Matter.Collision.collides(this.scenario.landingPlatform, this.agentBody);
        if (this.agentBody.position.x > window.innerWidth || this.agentBody.position.x < 0 || this.agentBody.position.y > window.innerHeight || this.agentBody.position.y < 0 || this.fuel < 1 || collision) {
            this.agentBody.render.visible = false;
            this.score = this.calculateReward(this.getStateF(), this.targetX, this.targetY);
            this.done = true;
            this.resetEnvironment()
        }
        this.fuel -= 0.5;
    }

    step(action: number) {
        this.fuel -= 1;
        this.applyAction(action);
        this.score = this.calculateReward(this.getStateF(), this.targetX, this.targetY);
        if (this.fuel < 1) {
            this.done = true
        }
        return { _state: this.getState(), reward: this.score, terminated: this.done }
    }

    calculateReward(state: State, targetX: number, targety: number) {
        let reward = 0;
        const distanceToTarget = Math.sqrt((state.agentX - targetX) ** 2 + (this.agentY - targety) ** 2);
        reward -= distanceToTarget;
        // const speed = Math.sqrt(state.velocityX ** 2 + state.velocityY ** 2);
        // reward -= speed;
        // // const angleError = Math.abs(state.angle);
        // reward -= angleError;
        // if (distanceToTarget < 1 && speed < 0.1 && angleError < 0.1 && this.fuel > 1) {
        //     reward += 1000;
        // }
        if (distanceToTarget < 1) {
            reward += 1000;
        }
        return reward;
    }

    // private beforeUpdate(callback: Function) {
    //     Matter.Events.on(this.scenario.engine, 'beforeUpdate', (cb: any) => {
    //         callback(cb);
    //     });
    // }

    // private afterUpdate(callback: Function) {

    //     Matter.Events.on(this.scenario.engine, 'afterUpdate', (cb: any) => {
    //         callback(cb);
    //     });
    // }
}