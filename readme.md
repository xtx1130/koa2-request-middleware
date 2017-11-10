## koa2-request-middleware
[![Build Status](https://travis-ci.org/xtx1130/koa2-request-middleware.svg?branch=master)](https://travis-ci.org/xtx1130/koa2-request-middleware)
[![Coverage Status](https://coveralls.io/repos/github/xtx1130/koa2-request-middleware/badge.svg?branch=master)](https://coveralls.io/github/xtx1130/koa2-request-middleware?branch=master)  
> a middleware for koa2 to separate request and response data's use

### 1.Usage

#### Use with koa2

```js
const Koax = require('koa2-request-middleware');
const Koa = require('koa');
const koaRouter =  require('koa-router');
let koax = new Koax();
let app = new Koa();
let approuter = new KoaRouter();
koax.mount(()=>{
	return koax.setName('testKoax1').cached().request({
		uri:'http://localhost:8012/testkoax1',
		method:'GET'
	})
});
approuter.get('/test',(ctx,next) => {
	ctx.body = ctx.koax.testKoax1;
	ctx.status = 200;
});
app.use(koax.middleware());
app.use(approuter.routes());
```
ctx.koax.testKoax1 is the response of testKoax1's request, <b>you can read the data ctx.koax in any middleware you want.</b>  
For more examples you can take a look at [test](https://github.com/xtx1130/koax-request/blob/master/test/test.js)

#### Use with koa-router

```js
const Koax = require('koa2-request-middleware');
const Koa = require('koa');
const koaRouter =  require('koa-router');
let koax = new Koax();
let app = new Koa();
let approuter = new KoaRouter();
koax.mount(()=>{
	return koax.setName('testKoax1').cached().request({
		uri:'http://localhost:8012/testkoax1',
		method:'GET'
	})
});
approuter.get('/test',koax.middleware(),(ctx,next) => {
	ctx.body = ctx.koax.testKoax1;
	ctx.status = 200;
});
app.use(approuter.routes());
```
This usage will just make request when come in router '/test',but the ctx.koax is in global.

### 2.APIs

+ `koax.mount(Function)` //Function must return a promise  
Use this API to mount request, and it will return koax instance

+ `koax.setName(String)`  
Use this API to set a name for response data, and it will return koax instance, if many requests has the same name, the last name's request will cover all the same name's data, because the data will mount on the instance of koa2

+ `koax.request(options,[name])`  
If you use the call chaining(koax.setName().request()),you can ignore the second argument,koax will cache the name you have setted.
Options details please see [request-promise](https://github.com/request/request-promise) for more information, and it will return promise instance

+ `koax.cached([name])`  
If you use the call chaining(koax.setName().cached()),you can ignore the second argument.When you use cached(), koax will only make request for once time and store the data in memory, and next time will take the data in memory, and it will return koax instance

+ `koax.middleware()`  
Make koax as a middleware in koa2

+ `koax.cancelCache([name])`  
This api is forced to change one of the requests from cached to uncached, it will return koax instance

+ `koax.reCache([name])`  
This api is forced to change one of the requests from uncached to cached, it will return koax instance

+ `koax.list`  
It will show you how many request is mounted on this instance of koax

### 3.request chain usage

You can use request like this
```js
koax.mount(async ()=>{
	let tes1 = await koax.setName('testKoax1').cached().request({
		uri:'http://localhost:8012/testkoax1',
		method:'GET'
	});
	await koax.setName('testKoax2').request({
			uri:'http://localhost:8012/testKoax2',
			method:'GET',
			qs:JSON.parse(tes1)
	},'testKoax2');
});
```
<b>Please pay attention to koax.mount() function argument needs a promise </b>
