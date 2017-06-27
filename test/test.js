'use strict';

const Koa = require('koa');
const koaRouter =  require('koa-router');
const testing = require('testing');
const koabody = require('koa-body');
const rp = require('request-promise');
const Koax = require('../index');

exports.test = module.exports.test = callback => {
	let tests = {};
	tests.Koas = async callback =>{
		console.log('test');
		let koatest = new Koa();
		let app = new Koa();
		let testrouter = new koaRouter();
		let approuter = new koaRouter();
		let koax = new Koax();
		testrouter.get('/testkoax1',(ctx,next)=>{
			ctx.res = JSON.stringify({'test':'ok','passing':'passed'});
			ctx.status = 200;
		});
		testrouter.post('/testkoax2',(ctx,next)=>{
			ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
			ctx.status = 200;
		});
		koatest.use(koabody());
		koatest.use(testrouter.routes());
		let testserver = koatest.listen('8012');
		koax.setName('testKoax1').cached().request({
			uri:'http://localhost:8012/testkoax1',
			method:'GET'
		}).then(data=>{
			console.dir(data)
			koax.setName('testKoax2').request({
				uri:'http://localhost:8012/testKoax2',
				method:'POST',
				body:data
			});
		});
		// testserver.close((error) => {
		// 	testing.check(error, 'Could not stop server', callback);
		// });
		approuter.get('/test',(ctx,next) => {
			ctx.body = ctx.koax.testKoax2;
			ctx.status = 200;
		})
		app.use(koax.middleware());
		app.use(approuter.routes())
		let server = app.listen('8011');
		testing.success(callback);
	}
	testing.run(tests, 1000, callback);
}
exports.test(testing.show);