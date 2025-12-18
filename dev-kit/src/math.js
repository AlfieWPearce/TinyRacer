/*
        Math.js contains useful maths low-level functions
*/

/**
 * Type definitions
 *
 * @typedef {{x: number, y: number}} vec2
 * @typedef {{x: number, y: number, z: number}} vec3
 */

/**
 * Clamps a value between min and max.
 *
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number} v clamped between min and max
 */
export function clamp(v, min, max) {
	return Math.min(max, Math.max(min, v));
}

/**
 * Wraps a value between min and max.
 *
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number} v wrapped between min and max
 */
export function wrap(v, min, max) {
	const r = max - min;
	return ((((v - min) % r) + r) % r) + min;
}

/**
 * Linear interpolation.
 *
 * Lerps a value between a and bat a point t.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} t - Interpolation amount (0..1)
 * @returns {number} value t amount between a and b
 */
export function lerp(a, b, t) {
	return a + (b - a) * t;
}

/**
 * Inverse linear interpolation.
 *
 * Finds a normalised position of v between a min and max.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} v - Interpolated value
 * @returns {number} how far v is between a and b (0..1)
 */
export function invLerp(a, b, v) {
	return (v - a) / (b - a);
}

/**
 * Smoothstep interpolation.
 *
 * @param {number} e0 - edge 0
 * @param {number} e1 - edge 1
 * @param {number} x
 * @returns {number} a smooth value between e0 and e1 x along
 */
export function smoothStep(e0, e1, x) {
	const t = clamp((x - e0) / (e1 - e0), 0, 1);
	return t * t * (3 - 2 * t);
}

/**
 * Distance squared between two points.
 *
 * Important as it skips the expensive sqrt.
 *
 * @param {vec2} a
 * @param {vec2} b
 * @returns Squared distance between a and b
 */
export function distSq(a, b) {
	return (b.x - a.x) ** 2 + (b.y - a.y);
}

/**
 * Euclidian distance between two points.
 *
 * Includes an expensive sqrt use distSq to avoid this.
 *
 * @param {vec2} a
 * @param {vec2} b
 * @returns Squared distance between a and b
 */
export function dist(a, b) {
	return Math.sqrt(distSq(a, b));
}

/**
 * Angle between two points
 *
 * @param {vec2} a
 * @param {vec2} b
 * @returns {number} Angle between two points
 */
export function angleBetween(a, b) {
	return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Remaps a value from one range to another.
 *
 * @param {number} v
 * @param {number} inMin
 * @param {number} inMax
 * @param {number} outMin
 * @param {number} outMax
 * @returns {number} v (inMin..inMax) to (outMin..outMax)
 */
export function map(v, inMin, inMax, outMin, outMax) {
	return lerp(outMin, outMax, invLerp(inMin, inMax, v));
}
