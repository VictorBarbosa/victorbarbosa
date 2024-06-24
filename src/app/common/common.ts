import Matter, { Engine, Events, Body } from "matter-js";
import p5 from "p5";


export const DEG2RAD = Math.PI / 180;
// Convert radians to degrees
/**
* @param {number} radians - The angle in radians to convert.
* @return {number} - The equivalent angle in degrees.
*/
export const radiansToDegrees = (radians: number): number => {
    return radians * (180 / Math.PI);
}

// Convert degrees to radians
/**
* @param {number} degrees - The angle in degrees to convert.
* @return {number} - The equivalent angle in radians.
*/
export const degreesToRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
}

// Draw a line on the canvas
/**
* @param {CanvasRenderingContext2D} context - The context of the canvas.
* @param {number} x1 - The x-coordinate of the starting point of the line.
* @param {number} y1 - The y-coordinate of the starting point of the line.
* @param {number} x2 - The x-coordinate of the ending point of the line.
* @param {number} y2 - The y-coordinate of the ending point of the line.
* @param {string} [color='red'] - The color of the line.
* @param {number} [lineWidth=2] - The width of the line.
* @return {void}
*/
export const drawLine = (context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = 'red', lineWidth = 2) => {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
}

// Draw text on the canvas
/**
* @param {CanvasRenderingContext2D} context - The context of the canvas.
* @param {string} text - The text to draw.
* @param {number} x - The x-coordinate of the text.
* @param {number} y - The y-coordinate of the text.
* @param {string} [font='30px Arial'] - The font style and size of the text.
* @param {string} [color='yellow'] - The color of the text.
* @return {void}
*/
export const drawText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, font = '20px Arial', color = 'yellow') => {
    context.font = font;

    context.fillStyle = color;

    context.fillText(text, x, y);
}


/**
* @param {p5} p - The p5 instance.
* @param {Matter.Body} body - The body to be drawn.
* @param {p5.Image} img - The image to be used for drawing the body.
*/
export const drawBody = (p: p5, body: Matter.Body, img?: p5.Image) => {
  const pos = body.position;
    const angle = body.angle;
    p.push();
    p.translate(pos.x, pos.y);
    p.rotate(angle);
    if (body.circleRadius) {

        if (img) {
            p.imageMode(p.CENTER);
            p.image(img, 0, 0, body.circleRadius * 2, body.circleRadius * 2);
        } else {
            p.ellipse(0, 0, body.circleRadius * 2);
        }
    } else {

        if (img) {
            p.imageMode(p.CENTER);
            p.image(img, 0, 0, body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y);
        } else {
            p.rectMode(p.CENTER);
            p.rect(0, 0, body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y);
        }
    }
    p.pop();
}
