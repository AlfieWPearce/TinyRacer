import Camera from './class/camera.js';
import Player from './class/player.js';
import { loop } from './game.js';
import * as renderer from './renderer.js';

export const { canvas, ctx } = renderer.getCanvas();
renderer.setSize(canvas, 256, 256);

export const car = new Player();
export const camera = new Camera();

requestAnimationFrame(loop);
