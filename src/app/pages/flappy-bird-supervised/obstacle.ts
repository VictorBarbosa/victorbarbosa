import * as p5 from "p5";

export default class Obstacle {

    minBottom = 0;
    maxBottom = 0;
    yBottom = 0;
    readonly distancePipe = 420;
    x = 0;
    velocity = 5;
    targetX = 0
    targetY = 0
    image!: p5.Image

    constructor(private p: p5, private upPipe: p5.Image, private downPipe: p5.Image, private w: number, private h: number, initX: number) {
        this.minBottom = this.h - 480;
        this.maxBottom = this.h - 140;

        this.yBottom = p.random(this.minBottom, this.maxBottom)
        this.x = initX;
    }

    /**
     *
     */
    draw() {
        const where = this.yBottom - this.distancePipe;
        const middlePipeHeight = (0 - this.downPipe.height) + where;
        if (where > 0) {
            const totalMiddlePipe = Math.round(where / this.downPipe.height) + 1
            for (let index = 0; index < totalMiddlePipe; index++) {
                if ((middlePipeHeight * index) > 0) {
                    this.p.image(this.downPipe, this.x, middlePipeHeight * index);
                } else {
                    this.p.image(this.downPipe, this.x, middlePipeHeight);
                }
            }
        }

        this.p.image(this.downPipe, this.x, this.yBottom);
        this.p.image(this.upPipe, this.x, this.yBottom - this.distancePipe);

        this.targetY = this.yBottom - 70;
        this.targetX = this.x + 65;
        // this.p.text('*', this.targetX, this.targetY); //Target
        this.image = this.downPipe
        this.x = this.x - this.velocity;
    }

    isOffscreen(obstacles: Obstacle[]): boolean {
        let offScreen = false;
        if (this.x + this.downPipe.width < -10) {
            const sort = obstacles.sort((a, b) => {
                if (a.x < b.x) { return 1; }
                if (a.x > b.x) { return -1; }
                return 0;
            });

            const lastX = sort[0].x + 400;
            this.x = lastX;
            this.yBottom = this.p.random(this.minBottom, this.maxBottom)
            offScreen = true
        }
        return offScreen
    }

    /**
   * Check if the bar pass for the for the play to add game score
   * @returns
   */
    isOffscreenScore(value: number): number {
        if (this.targetX > value) {
            return 1
        } else {
            return 0
        }
    }
}