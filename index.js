'use strict';
/*
 *@decription 公共数据统一管理
 *@author xtx1130
 *@memo 每一个koax实例会相应的维护一套数据
*/

const rp = require('request-promise');
const assert = require('assert');
const isEmptyObj = require('./deps/isEmptyObj');
const isAsync = require('./deps/isAsyncFunc');

const privateName = Symbol.for('koax.NameCache');
const privateAsync = Symbol.for('koax.privateAsync');

class koax {
	constructor(){
		this.data = {};
		this[privateName] = void 0;
		this.dataCache = {};
		this.dispatchFunction = [];
		this[privateAsync] = async (next) => {
			return await next();
		}
	}
	//设置数据的key
	setName(name){
		this.data[name]=this.data[name]||{};
		this[privateName] = name;
		return this;
	}
	/*
	 *@description request请求接口，这里数据挂载到data视图上
	*/
	async request(options, name) {
		let tplName = name || this[privateName];
		assert(tplName, 'no name has been declared.');
		/* istanbul ignore else */
		if (this.dataCache[tplName] && !isEmptyObj(this.data[tplName])) {
			return this.data[tplName];
		}
		try {
			let res = await rp(options);
			this.data[tplName] = res;
			return res;
		} catch (e) {
			throw e;
		}
	}
	/*use function*/
	mount(func) {
		process.env.NODE_ENV!='travis' && assert(isAsync(func),'the arguments must be an Async function');
		this.dispatchFunction.push(func);
		return this;
	}
	/*
	 *@description 为request请求添加缓存，防止下一次请求的时候进行http调用
	*/
	cached(name) {
		let tplName = name || this[privateName];
		this.dataCache[tplName] = true;
		return this;
	}
	cancelCache(name){
		let tplName = name || this[privateName];
		Object.defineProperty(this.dataCache,tplName,{
			get: () => {
				return false;
			},
			set: (val) => {
				return false;
			},
			configurable : true
		})
		return this;
	}
	reCache(name){
		let tplName = name || this[privateName];
		Object.defineProperty(this.dataCache,tplName,{
			get: () => {
				return true;
			},
			set: (val) => {
				return true;
			},
			configurable : true
		})
		return this;
	}
	//返回供koas调用的中间件，这里data挂在到ctx上
	middleware(){
		let _this = this;
		let dispatch = async (ctx,next) => {
			try{
				ctx.koax = ctx.koax||{};
				for(let i = 0;i < this.dispatchFunction.length;i++){
					var s = await this.dispatchFunction[i]()
				}
				let copy = Object.assign(ctx.koax,_this.data);
				/* istanbul ignore if */
				!isAsync(next)?this[privateAsync](next):await next();
			}catch(e){
				throw new Error(e)
			}
		}
		return dispatch;
	}
	get list(){
		return Object.keys(this.data)
	}
	set list(val){
		return Object.keys(this.data)
	}
}
exports = module.exports = koax;