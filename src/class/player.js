import * as maths from '../../dev-kit/src/math.js';
import * as input from '../input.js';

export default class Player {
	constructor() {
		this.pos = { x: 0, y: 0 };
		this.vel = { x: 0, y: 0 };
		this.lookAngle = 0; //Rad

		//Engine and speed
		this.acc = 2200; // px/s/s
		this.minSpeed = 10; // px/s
		this.maxSpeed = 1400; // px/s

		//Steering
		this.turnSpeed = 2.4; // rad/s

		//Grip
		this.lateralGrip = 20; //Sideways correction strength
		this.maxGripForce = 800; //clamp

		//Resistance
		this.rollingResistance = 1.1;
		this.airDrag = 0.00035;

		//Assist
		this.lowSpeedAssist = 0.45;
	}

	update(dt) {
		const keys = input.getKeys();

		//Direction vectors
		const forward = maths.forwardVector(this.lookAngle);
		const right = maths.perpVector(forward);

		//Speed
		const speed = maths.length(this.vel);

		//Steering (reduced at high speed)
		const speedFactor = maths.clamp(
			1 - speed / this.maxSpeed,
			0.25,
			1
		);
		const turn = this.turnSpeed * speedFactor;

		if (keys.left) this.lookAngle -= turn * dt;
		if (keys.right) this.lookAngle += turn * dt;
		this.lookAngle = maths.wrap(this.lookAngle, -Math.PI, Math.PI);

		//Engine force
		if (keys.thrust) {
			const engineForce = maths.multiplyVector(
				forward,
				this.acc * dt
			);
			this.vel = maths.addVectors(this.vel, engineForce);
			console.log(forward, engineForce, this.vel);
		}

		//Decompose velocity
		const forwardSpeed = maths.dot(this.vel, forward);
		const lateralSpeed = maths.dot(this.vel, right);

		//Lateral grip (skid control)
		let lateralGrip = this.lateralGrip;
		let maxGripForce = this.maxGripForce;

		if (keys.thrust) lateralGrip *= 0.7;

		let gripForce = -lateralSpeed * lateralGrip;
		gripForce = maths.clamp(gripForce, -maxGripForce, maxGripForce);

		this.vel = maths.addVectors(
			this.vel,
			maths.multiplyVector(right, gripForce * dt)
		);

		//Rolling resistance
		const rr = maths.clamp(
			1 - (1 / this.rollingResistance) * dt,
			0,
			1
		);
		this.vel = maths.multiplyVector(this.vel, rr);

		//Air drag (quadratic)
		const drag = this.airDrag * speed * speed;
		const dragFactor = maths.clamp(1 - drag * dt, 0, 1);
		this.vel = maths.multiplyVector(this.vel, dragFactor);

		//Low speed assist (kindness)
		if (speed < 60) {
			const corrected = maths.multiplyVector(
				forward,
				forwardSpeed
			);
			this.vel = maths.lerpVector(
				this.vel,
				corrected,
				this.lowSpeedAssist * dt * 60
			);
		}

		//Speed clamp
		this.vel = maths.clampVector(
			this.vel,
			-this.maxSpeed,
			this.maxSpeed
		);
		if (Math.abs(this.vel.x) < this.minSpeed) this.vel.x = 0;
		if (Math.abs(this.vel.y) < this.minSpeed) this.vel.y = 0;

		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;
	}

	draw(ctx, cx, cy) {
		ctx.save();
		ctx.translate(cx, cy);
		ctx.rotate(this.lookAngle);
		ctx.fillStyle = `red`;
		ctx.fillRect(-10, -6, 20, 12);
		ctx.restore();
	}
}
