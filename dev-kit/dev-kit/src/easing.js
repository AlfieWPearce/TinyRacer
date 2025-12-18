/*
        easing.js contains basic easing functions
*/

export function easeInQuad(t) {
	return t ** 2;
}

export function easeOutQuad(t) {
	return t * (2 - t);
}

export function easeInOutCubic(t) {
	return t < 0.5 ? 4 * t ** 3 : (-2 * t + 2) ** 3 / 2;
}

export function easeOutBack(t) {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}
