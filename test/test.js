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
const mockserver = require('./mockserver');

exports.test = module.exports.test = callback => {
	let tests = {};
	tests.Koas = async callback =>{
		let app = new Koa();
		let approuter = new koaRouter();
		let koax = new Koax();
		let koaxrouter = new Koax();

		testing.verify(typeof koax === 'object', 'koax must be an object');
		
		koax.mount(async ()=>{
			let tes1 = await koax.setName('testKoax1').cached('testKoax1').request({
				uri:'http://localhost:8012/testkoax1',
				method:'GET'
			});
			await koax.setName('testKoax2').request({
					uri:'http://localhost:8012/testKoax2',
					method:'GET',
					qs:JSON.parse(tes1)
				},'testKoax2');
		});

		koax.setName('testkoa1Only').cached().cancelCache().reCache().request({
			uri:'http://localhost:8012/testkoax1',
			method:'GET'
		});
		approuter.get('/test',(ctx,next) => {
			koax.cancelCache('testKoax1');
			koax.dataCache.testKoax1 = true;
			testing.verify(koax.dataCache.testKoax1 === false, 'when using cancelCache the varibles must be false');
			koax.reCache('testKoax1');
			koax.dataCache.testKoax1 = false;
			testing.verify(koax.dataCache.testKoax1 === true, 'when using cancelCache the varibles must be true');
			testing.verify(typeof ctx.koax.testkoa1Only == 'string','testkoa1Only must exists');
			ctx.body = ctx.koax.testKoax2;
			ctx.status = 200;
		});
		koaxrouter.mount(async () => {
			let tes = await koaxrouter.setName('testKoaxRouter').request({
				uri:'http://localhost:8012/testkoax1',
				method:'GET'
			});
		});
		approuter.get('/testrouter',koaxrouter.middleware(),(ctx,next)=>{
			testing.verify( ctx.koax.testKoaxRouter === true , 'Use with koa-router example' );
		});
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
			mockserver.close((error) => {
				testing.check(error, 'Could not stop server', callback);
			});
			server.close((error) => {
				testing.check(error, 'Could not stop server', callback);
			});
		}
		testing.success(callback);
	}
	testing.run(tests, 1000, callback);
}
exports.test(testing.show);