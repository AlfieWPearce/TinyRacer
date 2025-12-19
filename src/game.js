import { START_LINE, TRACK } from './config/track.js';
import { camera, canvas, car, ctx } from './main.js';
import { drawEffects } from './render/effects.js';
import { drawHud } from './render/hud.js';
import { drawOvalBackground } from './render/track.js';

let last = performance.now();
export function loop(now) {
	let dt = Math.min((now - last) / 1000, 0.033); //Clamp dt to 33ms | ~30fps
	last = now;

	update(dt);
	render();

	requestAnimationFrame(loop);
}

function update(dt) {
	car.update(dt);

	camera.update({ ...car.pos }, { ...car.vel }, dt);
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//Background
	ctx.fillStyle = '#bbb';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.save();
	ctx.translate(
		canvas.width / 2 - camera.pos.x,
		canvas.height / 2 - camera.pos.y
	);

	drawOvalBackground(ctx, TRACK, START_LINE);
	drawEffects(ctx, car);

	car.draw(ctx);

	ctx.restore();

	drawHud(ctx, canvas, car);
}
