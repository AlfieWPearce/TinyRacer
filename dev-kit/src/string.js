/*
        string.js handles string manipulation functions
*/

/**
 * Formats time
 * 
 * @param {number} t - in s
 * @returns {string} m:ss.ms
 */
export function formatTime(t) {
	const m = Math.floor(t / 60);
	const s = (t % 60).toFixed(2).padStart(5, '0');
	return `${m}:${s}`;
}