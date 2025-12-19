export function getCanvas() {
	return {
		canvas: document.getElementById(`game`),
		ctx: document.getElementById(`game`).getContext(`2d`),
	};
}

export function setSize(canvas, width, height) {
	canvas.width = width;
	canvas.height = height;
}
