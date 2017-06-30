'use strict';

require("babel-core/register");
require("babel-polyfill");

const Koa = require('koa');
const koaRouter =  require('koa-router');
const testing = require('testing');
const koabody = require('koa-body');
const rp = require('request-promise');
const Koax = require('../index');
const url = require('url');
const queryString = require('querystring');

exports.test = module.exports.test = callback => {
	let tests = {};
	tests.Koas = async callback =>{
		let koatest = new Koa();
		let app = new Koa();
		let testrouter = new koaRouter();
		let approuter = new koaRouter();
		let koax = new Koax();
		testing.verify(typeof koax === 'object', 'koax must be an object');
		testrouter.get('/testkoax1',async (ctx,next)=>{
			ctx.body = JSON.stringify({test:'ok',passing:'passed'});
			ctx.status = 200;
			await next();
		});
		testrouter.get('/testkoax2',async (ctx,next)=>{
			let querystr = ctx.request.query;
			ctx.body = `Request Body: ${JSON.stringify(querystr)}`;
			ctx.status = 200;
			await next();
		});
		koatest.use(koabody());
		koatest.use(testrouter.routes());
		let testserver = koatest.listen('8012');
		koax.mount(()=>{
			return koax.setName('testKoax1').cached().request({
				uri:'http://localhost:8012/testkoax1',
				method:'GET'
			}).then(data => {
				return koax.setName('testKoax2').request({
					uri:'http://localhost:8012/testKoax2',
					method:'GET',
					qs:JSON.parse(data)
				},'testKoax2');
			});
		});
		koax.mount(()=>{
			return koax.setName('testkoa1Only').cached().request({
				uri:'http://localhost:8012/testkoax1',
				method:'GET'
			})
		})
		approuter.get('/test',(ctx,next) => {
			koax.cancelCache('testKoax1');
			koax.dataCache.testKoax1 = true;
			testing.verify(koax.dataCache.testKoax1 === false, 'when using cancelCache the varibles must be false');
			koax.reCache('testKoax1');
			koax.dataCache.testKoax1 = false;
			testing.verify(koax.dataCache.testKoax1 === true, 'when using cancelCache the varibles must be true');
			testing.verify(typeof ctx.koax.testkoa1Only == 'string','testkoa1Only must exists');
			ctx.body = ctx.koax.testKoax1;
			ctx.status = 200;
		})
		app.use(koax.middleware());
		app.use(approuter.routes());
		let server = app.listen('8011');
		let testrp = await rp({
			url:'http://localhost:8011/test',
			method:'GET'
		}).then(data=>{
			testing.verify(data.length, 'the response data must have contents');
			return new Promise((res,rej)=>{res()});
		});
		koax.list = 1;
		testing.verify(Array.isArray(koax.list), 'koax.list must be an array');
		if(process.env.NODE_ENV === 'travis'){
			testserver.close((error) => {
				testing.check(error, 'Could not stop server', callback);
			});
			server.close((error) => {
				testing.check(error, 'Could not stop server', callback);
			});
			testing.success(callback);
		}else{
			testing.success(callback);
		}
	}
	testing.run(tests, 1000, callback);
}
exports.test(testing.show);