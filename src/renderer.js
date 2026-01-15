import { formatTime } from '../../dev-kit/src/string.js';
import Camera from './class/camera.js';
import { TILE_PROPS } from './config/track.js';
import { GAME_STATE } from './states.js';
import { isCCComplete, loadRecord } from './storage.js';

export default class Renderer {
	constructor(game) {
		this.getCanvas();
		this.setSize(256, 256);

		this.game = game;
		this.camera = new Camera();
	}
	getCanvas() {
		this.canvas = document.getElementById(`game`);
		this.ctx = document.getElementById(`game`).getContext(`2d`);
	}
	setSize(width, height) {
		this.canvas.width = width;
		this.canvas.height = height;
	}
	render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (this.game.state === GAME_STATE.MENU) {
			this.drawMenu();
			return;
		}

		//Background
		this.ctx.fillStyle = TILE_PROPS['#'].colour; //Wall colour
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.save();
		this.ctx.translate(
			this.canvas.width / 2 - this.camera.pos.x,
			this.canvas.height / 2 - this.camera.pos.y
		);

		this.drawLevel();
		this.drawEffects();
		this.drawCar();

		this.ctx.restore();

		this.drawHud();
	}

	drawMenu() {
		this.ctx.fillStyle = '#111';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = '#fff';
		this.ctx.textAlign = 'center';

		const centre = this.canvas.width / 2;

		this.ctx.font = '20px monospace';
		this.ctx.fillText('TINY RACER', centre, 40);

		const unlocked =
			!this.game.track.unlocksAfter ||
			isCCComplete(this.game.track.unlocksAfter);
		if (!unlocked) this.ctx.globalAlpha = 0.35;

		this.ctx.font = '10px monospace';
		const { name, laps, cc } = this.game.track;
		this.ctx.fillText(`Track: ${name}`, centre, 80);

		this.ctx.fillText(`Laps: ${laps}`, centre, 95);
		this.ctx.fillText(`cc: ${cc}`, centre, 110);

		const record = loadRecord(this.game.track.id);
		this.ctx.fillText(
			`Best time: ${
				record
					? formatTime(record.bestTime)
					: '--:--.--'
			}`,
			centre,
			this.canvas.height - 95
		);
		this.ctx.fillText(
			`Best lap: ${
				record ? formatTime(record.bestLap) : '--:--.--'
			}`,
			centre,
			this.canvas.height - 80
		);

		this.ctx.globalAlpha = 1;

		this.ctx.font = '8px monospace';

		let x = centre - 40;
		for (const cc of [50, 100, 150]) {
			const done = isCCComplete(cc);
			this.ctx.fillStyle = done ? '#3f3' : '#777';
			this.ctx.fillText(
				`${cc}cc`,
				x,
				this.canvas.height - 45
			);
			x += 40;
		}

		this.ctx.fillStyle = '#fff';
		this.ctx.font = '10px monospace';

		this.ctx.fillText(
			unlocked
				? 'Press SPACE to start'
				: 'Complete previous CC',
			centre,
			this.canvas.height - 20
		);

		this.ctx.textAlign = 'right';
		this.ctx.font = '7px monospace';
		this.ctx.fillText(
			'Press BACKSPACE to reset',
			this.canvas.width - 5,
			this.canvas.height - 5
		);

		this.ctx.textAlign = 'left';
	}

	drawLevel() {
		const level = this.game.track.level;
		for (let y = 0; y < level.tiles.length; y++) {
			for (let x = 0; x < level.tiles[y].length; x++) {
				this.ctx.fillStyle =
					TILE_PROPS[level.tiles[y][x]].colour;
				this.ctx.fillRect(
					x * level.tileSize,
					y * level.tileSize,
					level.tileSize,
					level.tileSize
				);
			}
		}
		this.ctx.fillStyle = '#fff';
		this.ctx.fillRect(
			level.finishLine.x,
			level.finishLine.y,
			level.finishLine.width,
			level.finishLine.height
		);
	}

	drawCar() {
		this.ctx.save();
		this.ctx.translate(this.game.car.pos.x, this.game.car.pos.y);
		this.ctx.rotate(this.game.car.lookAngle);
		this.ctx.fillStyle = '#f05050';
		this.ctx.fillRect(
			-this.game.car.height / 4,
			-this.game.car.width / 4,
			this.game.car.height / 2,
			this.game.car.width / 2
		);
		this.ctx.restore();
	}

	drawHud() {
		this.ctx.textBaseline = 'middle';
		if (this.game.race.finished) {
			//black transparent background
			this.ctx.fillStyle = '#000';
			this.ctx.globalAlpha = 0.3;
			this.ctx.fillRect(
				0,
				0,
				this.canvas.width,
				this.canvas.height
			);
			this.ctx.globalAlpha = 1;

			//Finished text
			this.ctx.fillStyle = '#fff';
			this.ctx.font = '14px monospace';
			this.ctx.fillText(
				`FINISH`,
				this.canvas.width / 2 - 24,
				this.canvas.height / 2 - 10
			);

			this.ctx.font = '10px monospace';
			this.ctx.fillText(
				`Time: ${formatTime(
					this.game.race.finishTime
				)}`,
				this.canvas.width / 2 - 50,
				this.canvas.height / 2 + 10
			);
			this.ctx.fillText(
				`Best: ${formatTime(
					Math.min(...this.game.race.lapTimes)
				)}`,
				this.canvas.width / 2 - 50,
				this.canvas.height / 2 + 20
			);

			return;
		}

		this.ctx.fillStyle = '#fff';
		this.ctx.font = '10px monospace';

		//Lap counter
		this.ctx.fillText(
			`Lap: ${this.game.race.lap}/${this.game.race.level.laps}`,
			8,
			12
		);
		//Current lap time
		this.ctx.fillText(
			`Time: ${formatTime(this.game.race.currentLapTime)}`,
			8,
			24
		);

		//1+ lap complete?
		if (this.game.race.lapTimes.length > 0) {
			//Last lap time
			this.ctx.fillText(
				`Last: ${formatTime(
					this.game.race.lapTimes.at(-1)
				)}`,
				8,
				36
			);

			//Best lap time
			const best = Math.min(...this.game.race.lapTimes);
			this.ctx.fillText(`Best: ${formatTime(best)}`, 8, 48);

			//Delta lap time - last to best
			const delta = this.game.race.lapTimes.at(-1) - best;
			this.ctx.fillStyle = delta > 0 ? '#f23' : '#3f3';
			this.ctx.fillText(
				`Delta: ${delta > 0 ? '+' : '-'}${formatTime(
					delta
				)}`,
				8,
				60
			);
		}

		//Countdown?
		if (this.game.race.countdownActive) {
			this.ctx.fillStyle = '#fff';
			this.ctx.font = '32px monospace';
			this.ctx.textAlign = 'center';
			this.ctx.fillText(
				Math.ceil(this.game.race.countdown),
				this.canvas.width / 2,
				this.canvas.height / 2
			);
			this.ctx.textAlign = 'left';
		} else if (!this.game.race.raceStarted) {
			this.ctx.fillStyle = '#fff';
			this.ctx.font = '32px monospace';
			this.ctx.textAlign = 'center';
			this.ctx.fillText(
				'GO!',
				this.canvas.width / 2,
				this.canvas.height / 2
			);
			this.ctx.textAlign = 'left';
		}
	}

	drawEffects() {
		for (let i = this.game.car.skidMarks.length - 1; i >= 0; i--) {
			const mark = this.game.car.skidMarks[i];
			this.ctx.fillStyle = `rgba(30,30,30,${mark.life})`;
			this.ctx.fillRect(mark.x - 2, mark.y - 2, 4, 4);
			mark.life -= 0.02; //Fade speed
			if (mark.life <= 0)
				this.game.car.skidMarks.splice(i, 1);
		}
	}
}
