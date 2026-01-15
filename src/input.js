const keys = {};
window.addEventListener(`keydown`, (e) => (keys[e.code] = true));
window.addEventListener(`keyup`, (e) => (keys[e.code] = false));

export function getKeys() {
	return {
		thrust: keys.Space,
		confirm: keys.Space,

		left: keys.ArrowLeft,
		last: keys.ArrowLeft,

		right: keys.ArrowRight,
		next: keys.ArrowRight,

		delete: keys.Backspace,
	};
}
