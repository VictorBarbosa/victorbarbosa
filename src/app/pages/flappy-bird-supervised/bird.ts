import * as p5 from "p5";
import Obstacle from "./obstacle";

export default class Bird {

    /**
     * Property to indicate if the bird is still alive
     */
    isAlive: boolean = true;

    /**
     * Property to indicate where the bird is on the screen
     */
    x: number = 70

    /**
     * Property to indicate where the bird is on the screen
     */
    y: number = 0

    /**
     * gravity
     */
    gravity = 0.9;

    /**
     * velocity
     */
    velocity = 0;

    /**
     * score
     */
    score = 0

    /**
     * generation
     */
    generation: number = 0

    /**
     * jumpForce
     */
    private jumpForce: number;

    /**
     * @param p
     * @param bird
     * @param ground
     * @param height
     * @param jumpForce
     */
    constructor(private p: p5, private bird: p5.Image, private ground: p5.Image, private height: number, jumpForce: number = -5) { // Valor ajustado aqui
        this.isAlive = true;
        this.y = (window.innerHeight / 2) - 170;
 
        this.jumpForce = jumpForce;
    }

    /**
     * Update the bird on screen
     * @param obstacles list with all obstacles
     */
    update(obstacles: Obstacle[]) {
        const sort = this.getNearObstacle(obstacles);
        let targetY = 0;
        let targetX = 0;
        if (sort?.targetX > this.x) {
            targetX = sort?.targetX - this.x;
        } else {
            targetX = this.x - sort?.targetX;
        }

        if (sort?.targetY < this.y) {
            targetY = sort?.targetY - this.y;
        } else {
            targetY = this.y - sort?.targetY;
        }

        this.fall(targetX, targetY);

        this.p.image(this.bird, this.x, this.y);
    }

    /**
     * function to go down the bird
     * @param targetX position
     * @param targetY position
     */
    private fall(targetX: number, targetY: number) {
        this.velocity += this.gravity;
        this.velocity *= 0.9;
        this.y += this.velocity;
        this.score = this.score - targetX - targetY;
    }

    /**
     * @param obstacles
     * @returns
     */
    private getNearObstacle(obstacles: Obstacle[]) {
        const sort = obstacles.filter(obs => obs.x >= this.x + this.bird.width).sort((a, b) => {
            if (a.x < b.x) { return -1; }
            if (a.x > b.x) { return 1; }
            return 0;
        });
        return sort[0];
    }

    /**
     * Test if there is a collision
     * @param obstacles
     * @returns
     */
    hits(obstacles: Obstacle[]) {
        const hasHit = false;
        const firstNear = obstacles.filter(obs => obs.x < this.x + this.bird.width).sort((a, b) => {
            if (a.x < b.x) { return -1; }
            if (a.x > b.x) { return 1; }
            return 0;
        })[0];

        if (
            (this.x + this.bird?.width > firstNear?.x &&
                this.x < firstNear.x + firstNear.image.width &&
                this.y + this.bird.height > firstNear.yBottom + 10)
            ||

            (this.x + this.bird?.width > firstNear?.x &&
                this.x < firstNear.x + firstNear.image.width &&
                this.y < firstNear.yBottom - 180)
        ) {
            this.isAlive = false;
        }

        return hasHit;
    }

    /**
     * Check if the bird is still on the scene
     */
    isOffScreen() {
        if (this.y + this.bird.height < 0 || this.y > this.height - this.ground.height) {
            this.isAlive = false;
        }
    }

    /**
     * Jump the Bird
     */
    jump() {
        this.velocity += this.jumpForce;
        this.velocity *= 0.9;
    }

    /**
     * This function is responsible for calling the neural network and taking action based on the neural network's response.
     * @param obstacles
     */
    info(obstacles: Obstacle[]): { agentY: number, targetY: number } {
        const sort = obstacles.filter(obs => obs.targetX >= this.x).sort((a, b) => {
            if (a.x < b.x) { return -1; }
            if (a.x > b.x) { return 1; }
            return 0;
        })[0];

        return { agentY: this.y, targetY: sort?.targetY };
    }
}
