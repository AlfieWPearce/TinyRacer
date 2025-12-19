const keys = {};
window.addEventListener(`keydown`, (e) => (keys[e.code] = true));
window.addEventListener(`keyup`, (e) => (keys[e.code] = false));

export function getKeys() {
	return {
		thrust: keys.Space,
		left: keys.ArrowLeft,
		right: keys.ArrowRight,
	};
}
