/*
 *@description ensure the func is async function or not
 *@author xtx1130
 *@return {boolean} ture\false
 */
'use strict';
exports = module.exports = func => {
	return Object.prototype.toString.call(func) === '[object AsyncFunction]'
}