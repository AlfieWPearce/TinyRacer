import * as tools from '../../dev-kit/src/index.js';

export default class Race {
	constructor(level) {
		//Level data
		this.level = {};
		Object.assign(this.level, level);

		//Lap data
		this.lap = 1;
		this.countdown = 3; // s
		this.countdownActive = true;
		this.finishCountdownActive = false;
		this.raceStarted = false;
		this.finished = false;
		this.finishTime = 0;
		this.lapTimes = [];
		this.currentLapTime = 0;

		this.wasOnLine = false;
		this.hasLeftLine = false;
	}

	handleLaps(pos, angle, dt) {
		//Countdown logic
		if (this.countdownActive) {
			this.countdown -= dt;
			if (this.countdown <= 0) {
				this.countdown = 0;
				this.countdownActive = false;
			}
			return;
		}
		//Update lap time
		this.currentLapTime += dt;
		const track = this.level.level;
		const onLine = tools.pointInRect(
			pos.x,
			pos.y,
			track.finishLine
		);

		//Must be correct direction
		const forward = tools.forwardVector(angle);
		const correctDirection =
			tools.dot(forward, track.finishLine.normal) > 0.5;

		if (!onLine) {
			this.hasLeftLine = true;
		}

		if (
			onLine &&
			!this.wasOnLine &&
			this.hasLeftLine &&
			correctDirection
		) {
			//Lap concludes
			if (!this.raceStarted) {
				this.raceStarted = true;

				this.wasOnLine = onLine;
				return;
			}
			this.lap++;
			this.lapTimes.push(this.currentLapTime);
			this.currentLapTime = 0;
			this.hasLeftLine = false;

			if (this.lap > this.level.laps) {
				this.lap--;
				this.countdown = 2;
				this.finishCountdownActive = true;
				this.finished = true;
				this.finishTime = this.lapTimes.reduce(
					(acc, a) => acc + a,
					0
				);
			}
		}

		this.wasOnLine = onLine;
	}

	updateFinishTimer(dt) {
		this.countdown -= dt;
		if (this.countdown <= 0) this.finishCountdownActive = false;
	}
}
