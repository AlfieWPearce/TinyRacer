export default class Camera {
	constructor() {
		this.x = 0;
		this.y = 0;
	}

	setPosition(pos) {
		this.x = pos.x;
		this.y = pos.y;
	}
}
