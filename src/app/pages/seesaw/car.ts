import Matter from "matter-js";
import { ITensorflowSettings } from "../../common/itensorflow-settings";
import { radiansToDegrees } from "../../common/common";
import * as tf from '@tensorflow/tfjs';

export enum Direction {
    left = 0,
    right = 1,
    nothing = 2
}

export default class Car extends ITensorflowSettings {
    override createData(): void { }
    body!: Matter.Body;
    carComposite!: Matter.Composite;
    axelB!: Matter.Constraint
    axelA!: Matter.Constraint
    wheelA: Matter.Body;
    wheelB: Matter.Body;

    get angle(): number {
        return radiansToDegrees(this.body.angle);
    }
    get wheelAPosition(): Matter.Vector {
        return this.wheelA.position;
    }
    get wheelBPosition(): Matter.Vector {
        return this.wheelB.position;
    }


    // Definindo categorias de colisão
    readonly carCategory = 0x0001;


    override settingTensorflow(): void { }
    override setScenario(): void { }
    constructor(xx: number, yy: number, width: number, height: number, wheelSize: number, private modelTrainned: tf.Sequential | tf.LayersModel | null, private name: string) {
        super(modelTrainned)
        const car = this.Composite.create({ label: 'Car' });
        const group = this.Body.nextGroup(true),
            wheelBase = 20,
            wheelAOffset = -width * 0.5 + wheelBase,
            wheelBOffset = width * 0.5 - wheelBase,
            wheelYOffset = 0;

        this.body = this.Bodies.rectangle(xx, yy, width, height, {
            mass: 1,
            render: { fillStyle: 'pink' },
            collisionFilter: {
                group: group,
                category: this.carCategory,
                mask: ~this.carCategory // ignore similar objects
            },
            chamfer: {
                radius: height * 0.5
            },
            density: 0.0002
        });

        this.wheelA = this.Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
            collisionFilter: {
                group: group
            },
            friction: 0.8
        });

        this.wheelB = this.Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
            render: { fillStyle: 'black' },
            collisionFilter: {
                group: group
            },
            friction: 0.8
        });

        this.axelA = this.Constraint.create({
            label: 'axelA',
            bodyB: this.body,
            pointB: { x: wheelAOffset, y: wheelYOffset },
            bodyA: this.wheelA,
            stiffness: 1,
            length: 0,
            render: { strokeStyle: 'green' }
        });

        this.axelB = this.Constraint.create({
            label: 'axelB',
            bodyB: this.body,
            pointB: { x: wheelBOffset, y: wheelYOffset },
            bodyA: this.wheelB,
            stiffness: 1,
            length: 0,
            render: { strokeStyle: 'green' }
        });
        const composite = Matter.Composite;
        composite.add(car, this.body)
        composite.add(car, this.wheelA)
        composite.add(car, this.wheelB)
        composite.add(car, this.axelA)
        composite.add(car, this.axelB)

        this.carComposite = car;
    }
    private goRight() {
        const forceMagnitude = 0.0007; // Adjust the force magnitude as needed
        const angle = this.body.angle;
        const forceX = forceMagnitude * Math.cos(angle);
        const forceY = forceMagnitude * Math.sin(angle);

        Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: forceX, y: forceY });
        Matter.Body.applyForce(this.wheelA, { x: this.wheelA.position.x, y: this.wheelA.position.y }, { x: forceX, y: forceY });
        Matter.Body.applyForce(this.wheelB, { x: this.wheelB.position.x, y: this.wheelB.position.y }, { x: forceX, y: forceY });
    }

    private goLeft() {
        const forceMagnitude = -0.0007; // Adjust the force magnitude as needed
        const angle = this.body.angle;
        const forceX = forceMagnitude * Math.cos(angle);
        const forceY = forceMagnitude * Math.sin(angle);

        Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: forceX, y: forceY });
        Matter.Body.applyForce(this.wheelA, { x: this.wheelA.position.x, y: this.wheelA.position.y }, { x: forceX, y: forceY });
        Matter.Body.applyForce(this.wheelB, { x: this.wheelB.position.x, y: this.wheelB.position.y }, { x: forceX, y: forceY });
    }

    action() {
        const prediction = this.model?.predict(tf.tensor([[this.wheelA.position.y, this.wheelB.position.y,]])) as tf.Tensor;


        // Use tf.argMax para obter o índice da classe prevista
        const classIdTensor = tf.argMax(prediction, 1);
        const classIdArray = classIdTensor.arraySync() as any;
        const classId = classIdArray[0]; // Como temos apenas uma amostra, pegamos o primeiro valor

        switch (classId) {
            case Direction.left: this.goLeft(); break;
            case Direction.right: this.goRight(); break;

            default:
                break;
        }
        console.log(`***Direction ${this.name} *** ${Direction[classId]} Angle ${this.angle}`,)
    }
}