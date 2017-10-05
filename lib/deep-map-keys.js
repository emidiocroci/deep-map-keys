"use strict";
var WeakMap = require('es6-weak-map');
var lodash_1 = require('lodash');
var DeepMapKeys = (function () {
    function DeepMapKeys(mapFn, opts) {
        this.mapFn = mapFn;
        this.opts = opts;
        this.cache = new WeakMap();
    }
    DeepMapKeys.prototype.map = function (value) {
        return lodash_1.isArray(value) ? this.mapArray(value) :
            lodash_1.isArrayBuffer(value) ? value : lodash_1.isObject(value) ? this.mapObject(value) :
                value;
    };
    DeepMapKeys.prototype.mapArray = function (arr) {
        if (this.cache.has(arr)) {
            return this.cache.get(arr);
        }
        var length = arr.length;
        var result = [];
        this.cache.set(arr, result);
        for (var i = 0; i < length; i++) {
            result.push(this.map(arr[i]));
        }
        return result;
    };
    DeepMapKeys.prototype.mapObject = function (obj) {
        if (this.cache.has(obj)) {
            return this.cache.get(obj);
        }
        var _a = this, mapFn = _a.mapFn, thisArg = _a.opts.thisArg;
        var result = {};
        this.cache.set(obj, result);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[mapFn.call(thisArg, key, obj[key])] = this.map(obj[key]);
            }
        }
        return result;
    };
    return DeepMapKeys;
}());
exports.DeepMapKeys = DeepMapKeys;
//# sourceMappingURL=deep-map-keys.js.map