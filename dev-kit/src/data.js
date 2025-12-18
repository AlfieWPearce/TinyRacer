/*
        data.js contains data manipulation functions
*/

/**
 * Generates an exact copy of an object - removes mutating
 *
 * @param {object} obj
 * @returns {object} A full copy of an object
 */
export function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Generates an object containing the keys and values of 2 others
 *
 * @param {object} obj1
 * @param {object} obj2
 * @returns {object}
 */
export function mergeObjects(obj1, obj2) {
	return { ...obj1, ...obj2 };
}

/**
 * Removes value from array
 *
 * @param {array} arr
 * @param {*} value
 * @returns {array} array without the value
 */
export function arrayRemove(arr, value) {
	return arr.filter((item) => item !== value);
}
