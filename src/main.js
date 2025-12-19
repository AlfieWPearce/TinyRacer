import { formatTime } from '../dev-kit/src/string.js';
import Camera from './class/camera.js';
import Player from './class/player.js';
import * as renderer from './renderer.js';

const { canvas, ctx } = renderer.getCanvas();
renderer.setSize(canvas, 256, 256);

const TILE_SIZE = 40;
export const TRACK = {
	centre: { x: 0, y: 0 },

	outer: { rx: 300, ry: 240 },
	inner: { rx: 220, ry: 160 },

	edge: 10,

	playerStartPos: { x: 240, y: 0 },
	playerStartAngle: -Math.PI / 2,
};
export const START_LINE = {
	x: TRACK.inner.rx - TRACK.edge - 2, // near outer edge
	y: -20,
	width: TRACK.outer.rx - TRACK.inner.rx + 2 * TRACK.edge + 2,
	height: 5,
	normal: { x: 0, y: -1 }, // direction you must cross
};

const car = new Player();

const camera = new Camera();

const keys = {};
window.addEventListener(`keydown`, (e) => (keys[e.code] = true));
window.addEventListener(`keyup`, (e) => (keys[e.code] = false));

let last = performance.now();
function loop(now) {
	let dt = Math.min((now - last) / 1000, 0.033); //Clamp dt to 33ms | ~30fps
	last = now;

	update(dt);
	render();

	requestAnimationFrame(loop);
}

function update(dt) {
	car.update(dt);

	camera.update({ ...car.pos }, { ...car.vel }, dt);
	// camera.setPosition({ ...car.pos });
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

	drawOvalBackground();
	drawEffects();

	car.draw(ctx);

	ctx.restore();

	drawHud();
}

function drawOvalBackground() {
	//Outer grass
	ctx.fillStyle = '#2f6b3c';
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.outer.rx + TRACK.edge,
		TRACK.outer.ry + TRACK.edge,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();

	//Tarmac
	ctx.fillStyle = '#555';
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.y,
		TRACK.outer.rx,
		TRACK.outer.ry,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();

	//Inner Grass
	ctx.fillStyle = '#2f6b3c';

	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.inner.rx,
		TRACK.inner.ry,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();

	//Start line
	ctx.fillStyle = '#ddd';
	ctx.fillRect(
		START_LINE.x,
		START_LINE.y,
		START_LINE.width,
		START_LINE.height
	);

	//Barriers
	ctx.strokeStyle = '#777';
	ctx.lineWidth = 2;
	//Outer
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.outer.rx + TRACK.edge,
		TRACK.outer.ry + TRACK.edge,
		0,
		0,
		Math.PI * 2
	);
	ctx.stroke();
	//Inner
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.inner.rx - TRACK.edge,
		TRACK.inner.ry - TRACK.edge,
		0,
		0,
		Math.PI * 2
	);
	ctx.stroke();

	//Background inner
	ctx.fillStyle = '#bbb';
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.inner.rx - TRACK.edge - 1,
		TRACK.inner.ry - TRACK.edge - 1,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();
}
function drawEffects() {
	for (let i = car.skidMarks.length - 1; i >= 0; i--) {
		const mark = car.skidMarks[i];
		ctx.fillStyle = `rgba(30,30,30,${mark.life})`;
		ctx.fillRect(mark.x - 2, mark.y - 2, 4, 4);
		mark.life -= 0.02; //Fade speed
		if (mark.life <= 0) car.skidMarks.splice(i, 1);
	}
}

/**
 * @deprecated
 */
function drawCheckerBoardBackground() {
	const startX =
		Math.floor((camera.pos.x - canvas.width / 2) / TILE_SIZE) *
		TILE_SIZE;
	const startY =
		Math.floor((camera.pos.y - canvas.height / 2) / TILE_SIZE) *
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
				x - camera.pos.x + canvas.width / 2,
				y - camera.pos.y + canvas.height / 2,
				TILE_SIZE,
				TILE_SIZE
			);
		}
	}
}

function drawHud() {
	ctx.textBaseline = 'middle';
	if (car.finished) {
		//black transparent background
		ctx.fillStyle = '#000';
		ctx.globalAlpha = 0.3;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;

		//Finished text
		ctx.fillStyle = '#fff';
		ctx.font = '14px monospace';
		ctx.fillText(
			`FINISH`,
			canvas.width / 2 - 24,
			canvas.height / 2 - 10
		);

		ctx.font = '10px monospace';
		ctx.fillText(
			`Time: ${formatTime(car.finishTime)}`,
			canvas.width / 2 - 50,
			canvas.height / 2 + 10
		);
		ctx.fillText(
			`Best: ${formatTime(Math.min(...car.lapTimes))}`,
			canvas.width / 2 - 50,
			canvas.height / 2 + 20
		);

		return;
	}

	ctx.fillStyle = '#fff';
	ctx.font = '10px monospace';

	//Lap counter
	ctx.fillText(`Lap: ${car.lap}/${car.maxLaps}`, 8, 12);
	//Current lap time
	ctx.fillText(`Time: ${formatTime(car.currentLapTime)}`, 8, 24);

	//1+ lap complete?
	if (car.lapTimes.length > 0) {
		//Last lap time
		ctx.fillText(`Last: ${formatTime(car.lapTimes.at(-1))}`, 8, 36);

		//Best lap time
		const best = Math.min(...car.lapTimes);
		ctx.fillText(`Best: ${formatTime(best)}`, 8, 48);

		//Delta lap time - last to best
		const delta = car.lapTimes.at(-1) - best;
		ctx.fillStyle = delta > 0 ? '#f23' : '#3f3';
		ctx.fillText(
			`Delta: ${delta > 0 ? '+' : '-'}${formatTime(delta)}`,
			8,
			60
		);
	}

	//Countdown?
	if (car.countdownActive) {
		ctx.fillStyle = '#fff';
		ctx.font = '32px monospace';
		ctx.textAlign = 'center';
		ctx.fillText(
			Math.ceil(car.countdown),
			canvas.width / 2,
			canvas.height / 2
		);
		ctx.textAlign = 'left';
	} else if (!car.raceStarted) {
		ctx.fillStyle = '#fff';
		ctx.font = '32px monospace';
		ctx.textAlign = 'center';
		ctx.fillText('GO!', canvas.width / 2, canvas.height / 2);
		ctx.textAlign = 'left';
	}
}

requestAnimationFrame(loop);
