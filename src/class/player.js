import * as tools from '../../dev-kit/src/index.js';

export default class Player {
	constructor(cc, level) {
		this.pos = tools.multiplyVector(level.start, level.tileSize);
		this.vel = tools.vector0;
		this.lookAngle = level.start.angle; //Rad

		this.level = level;

		this.width = 16;
		this.height = 24;

		this.skidMarks = [];
		this.skidThreshold = 11; // px/s - sideways

		//Engine and speed
		this.acc = 2200; // px/s/s
		this.boost = 1;
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

		this.applyCC(cc);
	}

	applyCC(cc) {
		this.acc *= cc.acc;
		this.maxSpeed *= cc.maxSpeed;
		this.lateralGrip *= cc.grip;
		this.turnSpeed *= cc.turn;
	}

	update(dt, keys) {
		//Handles driving surface
		const surface = this.level.getTilePropsAtWorld(
			this.pos.x,
			this.pos.y
		);

		const surfaceGrip = surface.grip;
		const surfaceDrag = surface.drag;
		const surfaceMaxSpeed = this.maxSpeed * surface.maxSpeed;

		this.boost -= dt * dt * 100;
		this.boost = surface.boost ?? this.boost;
		this.boost = tools.clamp(this.boost, 1, 10);

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
				this.acc * this.boost * dt
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
		const alignStrength =
			tools.lerp(0.18, 0.04, speedNorm) *
			surfaceGrip *
			(1 - Math.abs(lateralSpeed) / (speed + 1));
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
				this.lowSpeedAssist * surfaceGrip
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
		this.step(this.vel.x * dt, 0);
		this.step(0, this.vel.y * dt);
	}

	step(dx, dy) {
		const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
		if (steps === 0) return;

		const stepX = dx / steps;
		const stepY = dy / steps;
		for (let i = 0; i < steps; i++) {
			//X step
			this.pos.x += stepX;
			if (this.isColliding()) {
				this.pos.x -= stepX;
				this.vel.x = 0;
				this.vel.y *= 0.85;
				break;
			}

			//Y step
			this.pos.y += stepY;
			if (this.isColliding()) {
				this.pos.y -= stepY;
				this.vel.y = 0;
				this.vel.x *= 0.4;
				break;
			}
		}
	}
	isColliding() {
		const halfW = this.width / 2;
		const halfH = this.height / 2;
		const halfS = (halfW + halfH) / 4;

		const points = [
			{
				x: this.pos.x - halfS,
				y: this.pos.y - halfS,
			},
			{
				x: this.pos.x + halfS,
				y: this.pos.y - halfS,
			},
			{
				x: this.pos.x - halfS,
				y: this.pos.y + halfS,
			},
			{
				x: this.pos.x + halfS,
				y: this.pos.y + halfS,
			},
		];

		for (const p of points) {
			if (this.level.isWallAtWorld(p.x, p.y)) return true;
		}
	}
}
