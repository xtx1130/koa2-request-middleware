## koax-request
[![Build Status](https://travis-ci.org/xtx1130/koax-request.svg?branch=master)](https://travis-ci.org/xtx1130/koax-request)
[![Coverage Status](https://coveralls.io/repos/github/xtx1130/koax-request/badge.svg?branch=master)](https://coveralls.io/github/xtx1130/koax-request?branch=master)  
> a middleware for koa2 to separate request and resopnse data's use

### 1.Usage

```js
const Koax = require('koax-request');
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

### 2.APIs

+ koax.mount(Function) //Function must return a promise  
Use this API to mount request

+ koax.setName(String)  
Use this API to set a name for response data

+ koax.request(options,[name])  
If you use the call chaining(koax.setName().request()),you can ignore the second argument,koax will cache the name you have setted.
Options details please see [request-promise](https://github.com/request/request-promise) for more information

+ koax.cached([name])  
If you use the call chaining(koax.setName().cached()),you can ignore the second argument.When you use cached(), koax will only make request for once time and store the data in memory, and next time will take the data in memory

+ koax.middleware()  
Make koax as a middleware in koa2

### 3.request chain usage

You can use request like this
```js
koax.mount(()=>{
	return koax.setName('testKoax1').cached().request({
		uri:'http://localhost:8012/testkoax1',
		method:'GET'
	}).then(data => {
		return koax.setName('testKoax2').request({
			uri:'http://localhost:8012/testKoax2',
			method:'GET',
			qs:JSON.parse(data)
		});
	});
});
```
When the first request is finished, the data will store in memory and use request.then() to pass on data as next request params. <b>Please pay attention to promise return required in mount()</b>
