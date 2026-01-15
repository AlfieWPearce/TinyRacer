/*
        Type.js contains type checking functions
*/

export function isNull(value) {
	return value === null;
}

export function isUndefined(value) {
	return value === 'undefined';
}

export function isArray(value) {
	return Array.isArray(value);
}

export function isObject(value) {
	return typeof value === 'object' && !isNull(value) && !isArray(value);
}

export function isFunction(value) {
	return typeof value === 'function';
}
