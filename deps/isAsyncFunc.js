/*
 *@description ensure the func is async function or not
 *@author xtx1130
 *@return {boolean} ture\false
 */
'use strict';
exports = module.exports = func => {
	return func.constructor.name == 'AsyncFunction';
}