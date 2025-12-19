import * as tools from '../../dev-kit/src/index.js';
import * as input from '../input.js';

import { START_LINE, TRACK } from '../config/track.js';

export default class Player {
	constructor() {
		this.pos = TRACK.playerStartPos;
		this.vel = tools.vector0;
		this.lookAngle = TRACK.playerStartAngle; //Rad

		this.width = 16;
		this.height = 24;

		this.skidMarks = [];
		this.skidThreshold = 11; // px/s - sideways

		//Engine and speed
		this.acc = 2200; // px/s/s
		this.minSpeed = 20; // px/s
		this.maxSpeed = 1400; // px/s

		//Steering
		this.turnSpeed = 2.4; // rad/s

		//Grip
		this.lateralGrip = 20; //Sideways correction strength
		this.maxGripForce = 800; //clamp
		this.minGripForce = 0.15;

		//Resistance
		this.rollingResistance = 1.1;
		this.airDrag = 0.00035;

		//Assist
		this.lowSpeedAssist = 0.45;

		//Lap state
		this.lap = 1;
		this.maxLaps = 3;
		this.countdown = 3; // s
		this.countdownActive = true;
		this.raceStarted = false;
		this.finished = false;
		this.finishTime = 0;
		this.lapTimes = [];
		this.currentLapTime = 0;

		this.wasOnLine = false;
		this.hasLeftLine = false;
	}

	update(dt) {
		//Countdown logic
		if (this.countdownActive) {
			this.countdown -= dt;
			if (this.countdown <= 0) {
				this.countdown = 0;
				this.countdownActive = false;
			}
			return;
		}
		//Stop if finished state
		if (this.finished) return;
		//Update lap time
		this.currentLapTime += dt;

		const keys = input.getKeys();

		//Handles road vs grass
		const { onGrass } = this.surface();
		let surfaceGrip = 1;
		let surfaceDrag = 1;
		let surfaceMaxSpeed = this.maxSpeed;
		if (onGrass) {
			surfaceGrip = 0.35;
			surfaceDrag = 3.5;
			surfaceMaxSpeed *= 0.1;
		}

		//Direction vectors
		const forward = tools.forwardVector(this.lookAngle);
		const right = tools.perpVector(forward);

		//Speed
		const speed = tools.length(this.vel);
		const speedNorm = tools.clamp(speed / this.maxSpeed, 0, 1);

		//Steering (reduced at high speed)
		const turnInput = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
		const turnAssist = tools.lerp(1, 0.35, speedNorm);
		const turn = this.turnSpeed * turnAssist;

		this.lookAngle += turnInput * turn * dt;

		this.lookAngle = tools.wrap(this.lookAngle, -Math.PI, Math.PI);

		//Engine force
		if (keys.thrust) {
			const engineForce = tools.multiplyVector(
				forward,
				this.acc * dt
			);
			this.vel = tools.addVectors(this.vel, engineForce);
		}

		//Decompose velocity
		const forwardSpeed = tools.dot(this.vel, forward);
		const lateralSpeed = tools.dot(this.vel, right);

		//Skidding
		if (Math.abs(lateralSpeed) > this.skidThreshold) {
			this.skidMarks.push({
				x: this.pos.x,
				y: this.pos.y,
				life: 1.0, //1-0
			});
		}

		//Lateral grip (skid control)
		let grip = this.lateralGrip * surfaceGrip;

		//Oversteer bias
		grip *= tools.lerp(1, 0.45, speedNorm);

		//Nonlinear response - strong early , weak late
		const slipFactor = Math.abs(lateralSpeed) / (speed + 1);
		const gripScale = tools.clamp(
			1 - slipFactor * slipFactor,
			0.2,
			1
		);
		grip *= gripScale;

		//Powersliding
		const slideFactor = Math.abs(turnInput) * speedNorm;
		grip *= 1 - slideFactor * 0.7;
		grip = Math.max(grip, this.minGripForce);

		let gripForce = -lateralSpeed * grip;
		gripForce = tools.clamp(
			gripForce,
			-this.maxGripForce,
			this.maxGripForce
		);

		this.vel = tools.addVectors(
			this.vel,
			tools.multiplyVector(right, gripForce * dt)
		);

		//Velocity alignment assist
		const alignStrength = tools.lerp(0.18, 0.04, speedNorm);
		const desiredVel = tools.multiplyVector(forward, forwardSpeed);
		this.vel = tools.lerpVector(
			this.vel,
			desiredVel,
			alignStrength
		);

		//Rolling resistance
		const rr = Math.exp(-this.rollingResistance * surfaceDrag * dt);
		this.vel = tools.multiplyVector(this.vel, rr);

		//Air drag (quadratic)
		const drag = this.airDrag * speed * speed;
		this.vel = tools.multiplyVector(
			this.vel,
			tools.clamp(1 - drag * dt, 0, 1)
		);

		//Low speed assist (kindness)
		if (speed < 120) {
			this.vel = tools.lerpVector(
				this.vel,
				desiredVel,
				this.lowSpeedAssist
			);
		}

		//"Sticky" grass
		if (onGrass) {
			this.vel = tools.lerpVector(
				this.vel,
				{ ...tools.vector0 },
				0.15 * dt * speedNorm
			);
		}

		//Speed clamp
		this.vel = tools.clampVector(
			this.vel,
			-surfaceMaxSpeed,
			surfaceMaxSpeed
		);
		if (tools.length(this.vel) < this.minSpeed)
			this.vel = { ...tools.vector0 };

		//Integrate
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;

		this.handleCollisions();
		this.handleLaps();
	}

	surface() {
		const onOuter = tools.pointInEllipse(
			this.pos.x,
			this.pos.y,
			TRACK.centre.x,
			TRACK.centre.y,
			TRACK.outer.rx,
			TRACK.outer.ry
		).inside;

		const onInner = tools.pointInEllipse(
			this.pos.x,
			this.pos.y,
			TRACK.centre.x,
			TRACK.centre.y,
			TRACK.inner.rx,
			TRACK.inner.ry
		).inside;

		return {
			onRoad: onOuter && !onInner,
			onGrass: !(onOuter && !onInner),
		};
	}

	handleCollisions() {
		const { x: cx, y: cy } = TRACK.centre;

		//Outer wall
		const outerWall = tools.pointInEllipse(
			this.pos.x,
			this.pos.y,
			cx,
			cy,
			TRACK.outer.rx + TRACK.edge,
			TRACK.outer.ry + TRACK.edge
		).outside;
		if (outerWall) {
			const normal = tools.ellipseNormal(
				this.pos.x,
				this.pos.y,
				cx,
				cy,
				TRACK.outer.rx,
				TRACK.outer.ry
			);

			//Push back onto track
			this.pos.x -= normal.x;
			this.pos.y -= normal.y;

			//Kill velocity
			const vn = tools.dot(this.vel, normal);
			if (vn > 0) {
				this.vel = tools.subtractVectors(
					this.vel,
					tools.multiplyVector(normal, vn)
				);
			}

			//Wall friction
			this.vel = tools.multiplyVector(this.vel, 0.85);
			return;
		}

		//Inner wall
		const innerWall = tools.pointInEllipse(
			this.pos.x,
			this.pos.y,
			cx,
			cy,
			TRACK.inner.rx - TRACK.edge,
			TRACK.inner.ry - TRACK.edge
		).inside;
		if (innerWall) {
			const normal = tools.ellipseNormal(
				this.pos.x,
				this.pos.y,
				cx,
				cy,
				TRACK.inner.rx,
				TRACK.inner.ry
			);

			//Push back onto track
			this.pos.x += normal.x;
			this.pos.y += normal.y;

			//Kill velocity
			const vn = tools.dot(this.vel, normal);
			if (vn < 0) {
				this.vel = tools.subtractVectors(
					this.vel,
					tools.multiplyVector(normal, vn)
				);
			}

			//Wall friction
			this.vel = tools.multiplyVector(this.vel, 0.85);
		}
	}

	handleLaps() {
		const onLine = tools.pointInRect(
			this.pos.x,
			this.pos.y,
			START_LINE
		);

		//Must be correct direction
		const forward = tools.forwardVector(this.lookAngle);
		const correctDirection =
			tools.dot(forward, START_LINE.normal) > 0.5;

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

			if (this.lap > this.maxLaps) {
				this.lap--;
				this.finished = true;
				this.finishTime = this.lapTimes.reduce(
					(acc, a) => acc + a,
					0
				);
			}
		}

		this.wasOnLine = onLine;
	}

	draw(ctx) {
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.lookAngle);
		ctx.fillStyle = '#f05050';
		ctx.fillRect(
			-this.height / 4,
			-this.width / 4,
			this.height / 2,
			this.width / 2
		);
		ctx.restore();
	}
}
