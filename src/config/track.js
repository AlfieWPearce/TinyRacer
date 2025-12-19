export const TRACK = {
	centre: { x: 0, y: 0 },

	outer: { rx: 300, ry: 240 },
	inner: { rx: 220, ry: 160 },

	edge: 10,

	playerStartPos: { x: 240, y: 0 },
	playerStartAngle: -Math.PI / 2,
};
export const START_LINE = {
	x: TRACK.inner.rx - TRACK.edge - 2, // near outer edge
	y: -20,
	width: TRACK.outer.rx - TRACK.inner.rx + 2 * TRACK.edge + 2,
	height: 5,
	normal: { x: 0, y: -1 }, // direction you must cross
};
