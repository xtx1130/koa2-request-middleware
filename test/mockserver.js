'use strict'

require('babel-core/register')
require('babel-polyfill')

const Koa = require('koa')
const Router = require('koa-router')
const koabody = require('koa-body')
const koa = new Koa()
const router = new Router()

router.get('/testkoax1', async (ctx, next) => {
  ctx.body = JSON.stringify({test: 'ok', passing: 'passed'})
  ctx.status = 200
  await next()
})
router.get('/testkoax2', async (ctx, next) => {
  let querystr = ctx.request.query
  ctx.body = `Request Body: ${JSON.stringify(querystr)}`
  ctx.status = 200
  await next()
})
koa.use(koabody())
koa.use(router.routes())
let mockserver = koa.listen('8012')
console.log('mock server start at 8012')

exports = module.exports = mockserver
