/*
        dom.js contains simple but neceassary dom-manipulating functions
*/

/**
 * Returns a query selecter of s within the p element
 *
 * @param {string} s
 * @param {Element} [p=document]
 * @returns {Element|null}
 */
export function qs(s, p = document) {
	return p.querySelector(s);
}

/**
 * Returns an array from query selecter of s within the p element
 *
 * @param {string} s
 * @param {Element} [p=document]
 * @returns {Array|null}
 */
export function qsa(s, p = document) {
	return [...p.querySelectorAll(s)];
}

/**
 * Creates an element with the given data
 *
 * @param {string} tag
 * @param {string} [className=null]
 * @param {string} [text=null]
 * @returns {Element}
 */
export function el(tag, className = null, text = null) {
	const e = document.createElement(tag);
	if (className) e.className = className;
	if (text) e.text = text;
	return e;
}

/**
 * Applies style text (styles) to the element
 *
 * @param {Element} el
 * @param {string} styles
 */
export function css(el, styles) {
	Object.assign(el.style, styles);
}
