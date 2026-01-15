/*
        Collision.js handles collisions
*/
import * as maths from './math.js';

/**
 * @typedef {x:number, y:number, width: number, height: number} rect
 */

/**
 * Returns if the point is within the ellipse
 *
 * @param {number} px point
 * @param {number} py
 * @param {number} cx centre
 * @param {number} cy
 * @param {number} rx radius
 * @param {number} ry
 * @returns {boolean} if point is within the ellipse
 */
export function pointInEllipse(px, py, cx, cy, rx, ry) {
	const dx = (px - cx) / rx;
	const dy = (py - cy) / ry;
	const val = dx * dx + dy * dy;
	return { inside: val < 1, on: val == 1, outside: val > 1 };
}

export function ellipseNormal(px, py, cx, cy, rx, ry) {
	const n = {
		x: (px - cx) / (rx * rx),
		y: (py - cy) / (ry * ry),
	};
	const len = maths.length(n) || 1;
	return { x: n.x / len, y: n.y / len };
}

export function pointInRect(px, py, rect) {
	return (
		px >= rect.x &&
		px <= rect.x + rect.width &&
		py >= rect.y &&
		py <= rect.y + rect.height
	);
}
