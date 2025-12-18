const canvas = document.getElementById(`game`);
const ctx = canvas.getContext(`2d`);

canvas.width = 600;
canvas.height = 600;

const TILE_SIZE = 40;

const car = {
	x: 0,
	y: 0,
	angle: 0,
	maxSpeed: 300,
	speed: 0,
};

const camera = {
	x: 0,
	y: 0,
};

const keys = {};
window.addEventListener(`keydown`, (e) => (keys[e.code] = true));
window.addEventListener(`keyup`, (e) => (keys[e.code] = false));

let last = performance.now();
function loop(now) {
	const dt = (now - last) / 1000;
	last = now;
	update(dt);
	render();

	requestAnimationFrame(loop);
}

function update(dt) {
	if (keys['ArrowLeft']) car.angle -= 2.5 * dt;
	if (keys['ArrowRight']) car.angle += 2.5 * dt;

	if (keys['Space']) car.speed = car.maxSpeed;
	else car.speed = 0;

	car.x += Math.cos(car.angle) * car.speed * dt;
	car.y += Math.sin(car.angle) * car.speed * dt;

	camera.x = car.x;
	camera.y = car.y;
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawBackground();

	const cx = canvas.width / 2;
	const cy = canvas.height / 2;

	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(car.angle);
	ctx.fillStyle = `red`;
	ctx.fillRect(-10, -6, 20, 12);
	ctx.restore();
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
