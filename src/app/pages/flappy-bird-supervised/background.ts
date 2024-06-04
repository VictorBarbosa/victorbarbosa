import * as p5 from "p5";

export default class Background {

  /**
   *
   * @param p Instance
   * @param background  Instance
   * @param ground  Instance
   * @param w  Instance
   * @param y  Instance
   */
  constructor(private p: p5, private background: p5.Image, private ground: p5.Image, private w: number, private y: number) { }

  /**
   * Draw background
   */
  drawBackground() {
    const totalImage = Math.round((this.w / this.background.width)) + 1
    for (let index = 0; index < totalImage; index++) {
      this.p.image(this.background, this.background.width * index, this.y - this.ground.height - this.background.height)
    }
  }

  /**
   * draw the ground
   */
  drawGround() {
    const totalImage = Math.round((this.w / this.ground.width)) + 1
    for (let index = 0; index < totalImage; index++) {
      this.p.image(this.ground, this.ground.width * index, this.y - this.ground.height)
    }
  }
}