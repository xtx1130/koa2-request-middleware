'use strict';

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
		testrouter.get('/testkoax1',async (ctx,next)=>{
			ctx.body = JSON.stringify({test:'ok',passing:'passed'});
			ctx.status = 200;
			await next();
		});
		testrouter.get('/testkoax2',async (ctx,next)=>{
			let querystr = queryString.parse(url.parse(ctx.request.url).query)
			ctx.body = `Request Body: ${JSON.stringify(querystr)}`;
			ctx.status = 200;
			await next();
		});
		koatest.use(koabody());
		koatest.use(testrouter.routes());
		let testserver = koatest.listen('8012');
		koax.use(()=>{
			koax.setName('testKoax1').cached().request({
				uri:'http://localhost:8012/testkoax1',
				method:'GET'
			})
			.then(data=>{
				koax.setName('testKoax2').request({
					uri:'http://localhost:8012/testKoax2',
					method:'GET',
					qs:JSON.parse(data)
				});
			})
		});
		// testserver.close((error) => {
		// 	testing.check(error, 'Could not stop server', callback);
		// });
		approuter.get('/test',(ctx,next) => {
			ctx.body = ctx.koax.testKoax2;
			ctx.status = 200;
		})
		app.use(koax.middleware());
		app.use(approuter.routes());
		let server = app.listen('8011');
		let testrp = rp({
			url:'http://localhost:8011/test',
			method:'GET'
		}).then(data=>{
			console.log(data)
		});
		//testing.verify()
		testing.success(callback);
	}
	testing.run(tests, 1000, callback);
}
exports.test(testing.show);