'use strict';
/*
 *@decription 公共数据统一管理
 *@author xtx1130
 *@memo 每一个koax实例会相应的维护一套数据
*/

const rp = require('request-promise');
const assert = require('assert');
const isEmptyObj = require('./deps/isEmptyObj');

class koax {
	constructor(){
		this.data = {};
		this.nameCache = void 0;
		this.dataCache = {};
		this.dispatchFunction = [];
	}
	//设置数据的key
	setName(name){
		this.data[name]=this.data[name]||{};
		this.nameCache = name;
		return this;
	}
	/*
	 *@description request请求接口，这里数据挂载到data视图上
	*/
	async request(options, name) {
		let tplName = name || this.nameCache;
		assert(tplName, 'no name has been declared.');
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
		assert(typeof func === 'function','the arguments must be an function');
		this.dispatchFunction.push(func);
		return this;
	}
	/*
	 *@description 为request请求添加缓存，防止下一次请求的时候进行http调用
	*/
	cached(name) {
		let tplName = name || this.nameCache;
		this.dataCache[tplName] = true;
		return this;
	}
	cancelCache(name){
		let tplName = name || this.nameCache;
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
		let tplName = name || this.nameCache;
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
				await next();
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