'use strict'

exports = module.exports = obj => Object.prototype.toString.call(obj) === '[object Object]' && Object.keys(obj).length === 0
