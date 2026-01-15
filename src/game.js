import Player from './class/player.js';
import Race from './class/race.js';
import { CC_PROFILES, TRACKS } from './config/track.js';
import * as tools from './dev-kit/src/index.js';
import * as input from './input.js';
import { GAME_STATE } from './states.js';
import {
	clearStorage,
	isCCComplete,
	isCCFullyCleared,
	loadRecord,
	markCCComplete,
	saveRecord,
} from './storage.js';

export default class Game {
	constructor() {
		this.state = GAME_STATE.MENU;

		this.trackIndex = 0;
		this.track = TRACKS[this.trackIndex];

		this.car = null;
		this.race = null;

		this.next = false;
		this.last = false;
		this.confirm = false;
	}
	update(dt) {
		const inputs = input.getKeys();
		if (this.state == GAME_STATE.MENU) {
			if (inputs.delete) clearStorage();
			if (inputs.next && !this.next) {
				this.trackIndex++;
				this.next = true;
			} else if (!inputs.next) this.next = false;

			if (inputs.last && !this.last) {
				this.trackIndex--;
				this.last = true;
			} else if (!inputs.last) this.last = false;

			this.trackIndex = tools.wrap(
				this.trackIndex,
				0,
				TRACKS.length - 1
			);
			this.track = TRACKS[this.trackIndex];

			const unlocked =
				!this.track.unlocksAfter ||
				isCCComplete(this.track.unlocksAfter);
			if (inputs.confirm && !this.confirm && unlocked) {
				this.startRace();
				this.confirm = true;
			} else if (!inputs.confirm) this.confirm = false;
			return;
		}

		//Stop if finished state
		if (!this.race.finished) {
			if (!this.race.countdownActive)
				this.car.update(dt, inputs);
			this.race.handleLaps(
				this.car.pos,
				this.car.lookAngle,
				dt
			);
		} else {
			this.race.updateFinishTimer(dt);
			if (!this.race.finishCountdownActive) {
				this.endRace();
				this.confirm = true;
				return;
			}
		}

		this.renderer.camera.update(
			{ ...this.car.pos },
			{ ...this.car.vel },
			dt
		);
	}

	startRace() {
		this.track = TRACKS[this.trackIndex];
		this.car = new Player(
			CC_PROFILES[this.track.cc],
			this.track.level
		);
		this.race = new Race(this.track);
		this.state = GAME_STATE.RACE;
	}
	endRace() {
		const finishTime = this.race.finishTime;
		const bestLap = Math.min(...this.race.lapTimes);

		const previous = loadRecord(this.track.id);

		let record = {
			bestTime: finishTime,
			bestLap,
		};

		if (previous) {
			record.bestTime = Math.min(
				previous.bestTime,
				finishTime
			);
			record.bestLap = Math.min(previous.bestLap, bestLap);
		}

		saveRecord(this.track.id, record);

		if (isCCFullyCleared(this.track.cc, TRACKS))
			markCCComplete(this.track.cc);

		this.car = null;
		this.race = null;
		this.state = GAME_STATE.MENU;
	}
}
