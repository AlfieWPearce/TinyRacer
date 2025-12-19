import Camera from './class/camera.js';
import Player from './class/player.js';
import * as renderer from './renderer.js';

const { canvas, ctx } = renderer.getCanvas();
renderer.setSize(canvas, 600, 600);

const TILE_SIZE = 40;

const car = new Player();

const camera = new Camera();

const keys = {};
window.addEventListener(`keydown`, (e) => (keys[e.code] = true));
window.addEventListener(`keyup`, (e) => (keys[e.code] = false));

let last = performance.now();
function loop(now) {
	let dt = (now - last) / 1000;
	last = now;

	if (!Number.isFinite(dt)) return;
	dt = Math.min(dt, 0.033); //Clamp to 33ms | 30fps

	update(dt);
	render();

	requestAnimationFrame(loop);
}

function update(dt) {
	car.update(dt);

	camera.setPosition({ ...car.pos });
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawBackground();

	const cx = canvas.width / 2;
	const cy = canvas.height / 2;

	car.draw(ctx, cx, cy);
}

function drawBackground() {
	const startX =
		Math.floor((camera.x - canvas.width / 2) / TILE_SIZE) *
		TILE_SIZE;
	const startY =
		Math.floor((camera.y - canvas.height / 2) / TILE_SIZE) *
		TILE_SIZE;

	for (
		let y = startY;
		y < startY + canvas.height + TILE_SIZE;
		y += TILE_SIZE
	) {
		for (
			let x = startX;
			x < startX + canvas.width + TILE_SIZE;
			x += TILE_SIZE
		) {
			const isDark = (x / TILE_SIZE + y / TILE_SIZE) & 1;
			ctx.fillStyle = isDark ? '#2a2a2a' : '#333';

			ctx.fillRect(
				x - camera.x + canvas.width / 2,
				y - camera.y + canvas.height / 2,
				TILE_SIZE,
				TILE_SIZE
			);
		}
	}
}

requestAnimationFrame(loop);
