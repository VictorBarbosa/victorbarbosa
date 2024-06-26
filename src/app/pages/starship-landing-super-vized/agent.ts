import Matter from "matter-js";
import { DEG2RAD, degreesToRadians, drawBody, drawLine, radiansToDegrees } from "../../common/common";
import p5 from "p5";
import Main from "../../common/main";
import { Scenario } from "./scenario";
import * as tf from '@tensorflow/tfjs'

export enum SensorType {
    TunedOn = 1,
    TurnedOff = 0
}

export interface Sensor {
    x: number;
    y: number;
    sensorType?: SensorType
}

interface TrainnedModel {
    angle: tf.GraphModel<string | tf.io.IOHandler> | null;
    horizontal: tf.GraphModel<string | tf.io.IOHandler> | null;
    vertical: tf.GraphModel<string | tf.io.IOHandler> | null;
    combined: tf.GraphModel<string | tf.io.IOHandler> | null;
}

interface State {
    angle: number;
    agentX: number;
    targetX: number

}

enum AngleAction {
    Nothing = 0,
    LeftRotate = 1,
    RightRotate = 2
}
enum HorizontalAction {
    Left = 0,
    Right = 1,
}
enum VerticalAction {
    Nothing = 0,
    TurnOnEnging = 1,
}
/** Enum for possible actions */
// enum Action {
//     Nothing = 0,
//     LeftThrust = 1,
//     MainThrust = 2,
//     RightThrust = 3,
//     // LeftRotate = 4,
//     // RightRotate = 5,
// }

export default class Agent extends Main {
    done: boolean = false;
    private score: number = 0;
    readonly maxFuel: number = 1000;
    readonly category: number = 0x0001;
    agentBody!: Matter.Body;
    targetX: number = 0;
    targetY: number = 0;
    fuel = this.maxFuel;
    private engineBurn = false
    readonly actionSpace = 4;
    readonly observationSpace = 7
    sensors!: Sensor[]
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
        // return Object.keys(Action).length / 2;
        return -1;
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
    constructor(private p: p5, private scenario: Scenario, private img: p5.Image, private x: number, private y: number, private model: TrainnedModel) {
        super()
        this.agentBody = this.addStarship();
    }

    setTargetPosition(landingPlatformX: number, landingPlatformY: number) {
        this.targetX = landingPlatformX;
        this.targetY = landingPlatformY;
    }

    private addStarship(): Matter.Body {
        return this.Bodies.rectangle(this.x / 2, this.y, 22, 25, {
            angle: degreesToRadians(90),
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
        this.agentBody.angle -= 0.009;
    }
    private rotateRight() {
        this.agentBody.angle += 0.009;
    }

    private goLeft() {
        this.p.push();
        this.p.stroke('white');

        // Adjust these variables to control the spray effect
        const sprayRadius = 20;
        const numberOfLines = 50; // Increase this number for a denser spray
        const angleVariation = 30; // Degrees of variation around the main line

        for (let i = 0; i < numberOfLines; i++) {
            // Generate random angles within the specified variation
            const angleOffset = this.p.random(-angleVariation, angleVariation);
            const radianOffset = this.p.radians(angleOffset);

            // Calculate the end point of the line with some random length
            const length = this.p.random(10, sprayRadius);
            const endX = this.agentX + Math.cos(radianOffset) * length;
            const endY = this.agentY + Math.sin(radianOffset) * length;

            // Draw the line
            this.p.line(this.agentX + 5, this.agentY, endX, endY);
        }

        this.p.pop();
        this.Body.applyForce(this.agentBody, { x: this.agentBody.position.x, y: this.agentBody.position.y }, { x: -0.0001, y: 0 });
    }
    private goRight() {
        this.p.push();
        this.p.stroke('white');

        // Adjust these variables to control the spray effect
        const sprayRadius = 20;
        const numberOfLines = 50; // Increase this number for a denser spray
        const angleVariation = 30; // Degrees of variation around the main line

        for (let i = 0; i < numberOfLines; i++) {
            // Generate random angles within the specified variation
            const angleOffset = this.p.random(-angleVariation, angleVariation);
            const radianOffset = this.p.radians(angleOffset);

            // Calculate the end point of the line with some random length
            const length = this.p.random(10, sprayRadius);
            const endX = this.agentX - Math.cos(radianOffset) * length;
            const endY = this.agentY + Math.sin(radianOffset) * length;

            // Draw the line
            this.p.line(this.agentX - 5, this.agentY, endX, endY);
        }

        this.p.pop();
        this.Body.applyForce(this.agentBody, { x: this.agentBody.position.x, y: this.agentBody.position.y }, { x: 0.0001, y: 0 });
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

    }

    private applyMainThruster(body: Matter.Body, forceMagnitude: number) {
        this.engineBurn = true;
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

    drawFlame(x: number, y: number, flameHeight: number, baseWidth: number) {
        this.p.push()
        let r = this.p.random(255, 255); // Componente de cor vermelha variando entre 255
        let g = this.p.random(100, 255); // Componente de cor laranja/ amarela variando
        let b = this.p.random(0, 0); // Componente de cor azul variando
        this.p.fill(r, g, b);

        let dx1 = this.p.random(-2, 2);
        let dy1 = this.p.random(-2, 2);
        let dx2 = this.p.random(-2, 2);
        let dy2 = this.p.random(-2, 2);
        let dx3 = this.p.random(-2, 2);
        let dy3 = this.p.random(-2, 2);
        let dx4 = this.p.random(-2, 2);
        let dy4 = this.p.random(-2, 2);

        this.p.beginShape();

        this.p.vertex(x + dx1, y + dy1);
        this.p.vertex(x - baseWidth / 2 + dx2, y + flameHeight + dy2);
        this.p.vertex(x + dx3, y + flameHeight * 0.8 + dy3);
        this.p.vertex(x + baseWidth / 2 + dx4, y + flameHeight + dy4);
        this.p.endShape(this.p.CLOSE);
        this.p.pop()
    }


    private addSensors() {
        this.sensors.forEach(sensor => this.sensorAlert(sensor));
    }

    private sensorAlert(sensor: Sensor) {

        this.p.push()
        if (sensor.y > this.height) {
            this.p.fill('red');
            this.p.stroke('red');
            this.p.circle(sensor.x, sensor.y, 3)
        } else {
            this.p.fill('white')
            this.p.stroke('white');
            this.p.circle(sensor.x, sensor.y, 3)
        }
        this.p.line(this.agentX, this.agentY, sensor.x, sensor.y);
        this.p.pop()

    }

    private updateSensorPositions(numSensors: number, sensorOffset: number, angle: number, halfCircle: boolean = false) {
        const angleRad = DEG2RAD * angle;
        const sensorAngles = Array.from({ length: numSensors }, (_, index) => (index / numSensors) * (halfCircle ? 180 : 360));

        const sensors = sensorAngles.map(sensorAngle => {
            const sensorX = this.agentX + sensorOffset * Math.cos(angleRad - (DEG2RAD * sensorAngle));
            const sensorY = this.agentY + sensorOffset * Math.sin(angleRad - (DEG2RAD * sensorAngle));
            return { x: sensorX, y: sensorY };
        });
        return sensors;
    }

    action() {
        if (this.model !== undefined) {
            if (this.angle < -5 || this.angle > 5) {
                const inputTensor = tf.tensor(this.angle).reshape([-1, 1]);
                const prediction = this.model.angle?.predict(inputTensor) as tf.Tensor;
                const action = (tf.argMax(prediction, 1) as any).arraySync()[0];
                this.angleAction(action);
            }
            else if (this.agentY + 70 > this.targetY) {

                const inputTensor = tf.tensor2d([[this.agentY, this.targetY]]);
                const prediction = this.model.vertical?.predict(inputTensor) as tf.Tensor;
                const action = (tf.argMax(prediction, 1) as any).arraySync()[0];
                this.verticalAction(action)
            }
            else {
                const inputTensor = tf.tensor2d([[this.targetX, this.agentX]]);
                const prediction = this.model.horizontal?.predict(inputTensor) as tf.Tensor;
                const action = (tf.argMax(prediction, 1) as any).arraySync()[0];
                this.horizontalAction(action);
            }
        }

    }

    private angleAction(action: number) {

        switch (action) {
            case AngleAction.Nothing: break;
            case AngleAction.LeftRotate: this.rotateLeft(); break;
            case AngleAction.RightRotate: this.rotateRight(); break;
        }
    }
    private horizontalAction(action: number) {

        switch (action) {
            case HorizontalAction.Left: this.goLeft(); break;
            case HorizontalAction.Right: this.goRight(); break;
        }
    }
    private verticalAction(action: number) {
        console.log("VerticalAction", VerticalAction[action])
        switch (action) {
            case VerticalAction.Nothing: ; break;
            case VerticalAction.TurnOnEnging: this.applyMainThruster(this.agentBody, 0.001); break;
        }
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

    update() {
        this.sensors = []
        if (this.engineBurn) {
            this.drawFlame(this.agentX, this.agentY + 10, 50, 20);
        }
        // this.sensors.push(...
        //     [
        //         ...this.updateSensorPositions(1, 40, this.angle + 50, true),
        //         ...this.updateSensorPositions(1, 40, this.angle + 90, true),
        //         ...this.updateSensorPositions(1, 40, this.angle + 130, true),
        //         // ...this.updateSensorPositions(1, 80, this.a, true),
        //     ])
        // this.addSensors()

        this.p.push();
        this.p.stroke('red')
        this.p.line(this.agentX, this.agentY, this.targetX, this.targetY);
        this.p.pop();
        // drawBody(this.p, this.agentBody);
        drawBody(this.p, this.agentBody, this.img);
        this.p.push();


        this.p.push();
        this.p.fill('white')



        this.p.text(`Fuel ${this.percentFuel}% `, this.agentX + 10, this.agentY - 50)
        this.p.text(`Distance ${this.distance} `, this.agentX + 10, this.agentY - 40)
        this.p.text(`Angle ${this.angle} `, this.agentX + 10, this.agentY - 30)
        this.p.text(`Velocity ${this.speed} `, this.agentX + 10, this.agentY - 20)
        this.p.pop();
        this.engineBurn = false;
        this.checkIsAlive();

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