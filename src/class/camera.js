import * as maths from '../dev-kit/src/math.js';

export default class Camera {
	constructor() {
		this.pos = { ...maths.vector0 };
		this.vel = { ...maths.vector0 };

		this.lookAhead = { ...maths.vector0 };

		this.followStrength = 40; //higher = snappier
		this.lookAheadDist = 20; // px
		this.lookAheadStrength = 0.1;
	}

	update(targetPos, targetVel, dt) {
		const speed = maths.length(targetVel);

		if (speed > 5) {
			const dir = maths.multiplyVector(targetVel, 1 / speed);
			const desiredLookAhead = maths.multiplyVector(
				dir,
				this.lookAheadDist
			);
			this.lookAhead = maths.lerpVector(
				this.lookAhead,
				desiredLookAhead,
				this.lookAheadDist * dt
			);
		} else {
			this.lookAhead = maths.lerpVector(
				this.lookAhead,
				maths.vector0,
				this.lookAheadStrength * dt
			);
		}

		const desired = maths.addVectors(targetPos, this.lookAhead);

		const toTarget = maths.subtractVectors(desired, this.pos);

		this.vel = maths.addVectors(
			this.vel,
			maths.multiplyVector(toTarget, this.followStrength * dt)
		);

		this.vel = maths.multiplyVector(this.vel, 0.85);

		this.pos = maths.addVectors(
			this.pos,
			maths.multiplyVector(this.vel, dt)
		);
	}
}
