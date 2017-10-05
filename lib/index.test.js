"use strict";
var chai = require('chai');
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var deepMapKeys = require('./');
before(function () {
    chai.use(sinonChai);
    chai.should();
});
describe('deepMapKeys(object, mapFn, [options])', function () {
    var caps;
    beforeEach(function () {
        caps = sinon.spy(function (key) { return key.toUpperCase(); });
    });
    it('exports a function', function () {
        deepMapKeys.should.be.a('function');
    });
    describe('@object: any', function () {
        it('transforms keys of simple object', function () {
            deepMapKeys({ one: 1, two: 2 }, caps).should.deep.equal({ ONE: 1, TWO: 2 });
        });
        it('transforms keys of object with nested objects/arrays', function () {
            deepMapKeys({ one: 1, obj: { two: 2, three: 3 }, arr: [4, 5] }, caps)
                .should.deep.equal({ ONE: 1, OBJ: { TWO: 2, THREE: 3 }, ARR: [4, 5] });
        });
        it('transforms keys of array with nested object/array', function () {
            deepMapKeys([1, { two: 2, three: 3, arr: [4, { five: 5 }] }], caps)
                .should.deep.equal([1, { TWO: 2, THREE: 3, ARR: [4, { FIVE: 5 }] }]);
        });
        function str2ab(str) {
            var buf = new ArrayBuffer(str.length * 2);
            var bufView = new Uint16Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }
        function ab2str(buf) {
            return String.fromCharCode.apply(null, new Uint16Array(buf));
        }
        it('doesn\'t transform an ArrayBuffer to an empty array', function () {
            var buffer = str2ab('test');
            var transformed = deepMapKeys({ two: 2, three: 3, arr: buffer }, caps);
            ab2str(transformed.ARR).should.be.equal('test');
        });
        it('transforms an object with circular references', function () {
            var obj = { one: 1, arr: [2, 3], self: null, arr2: null };
            obj.self = obj;
            obj.arr2 = obj.arr;
            var exp = { ONE: 1, ARR: [2, 3], SELF: null, ARR2: null };
            exp.SELF = exp;
            exp.ARR2 = exp.ARR;
            deepMapKeys(obj, caps).should.deep.equal(exp);
        });
    });
    describe('@mapFn(key: string, value: any): string', function () {
        it('throws Error if undefined', function () {
            deepMapKeys.bind(null, { one: 1 }).should.throw(Error);
        });
        it('throws TypeError if not a function', function () {
            deepMapKeys.bind(null, { one: 1 }, 42).should.throw(TypeError);
        });
        it('is called once per object property', function () {
            deepMapKeys({ one: 1, obj: { two: 2, three: 3 }, arr: [4, 5] }, caps);
            caps.should.have.callCount(5);
        });
        it('is called with @key as first argument', function () {
            deepMapKeys({ one: 1, arr: [2, 3] }, caps);
            caps.should.have.been.calledWith('one');
            caps.should.have.been.calledWith('arr');
        });
        it('is called with @value as second argument', function () {
            var any = sinon.match.any;
            deepMapKeys({ one: 1, arr: [2, 3] }, caps);
            caps.should.have.been.calledWith(any, 1);
            caps.should.have.been.calledWithMatch(any, [2, 3]);
        });
    });
    describe('@options?', function () {
        it('throws TypeError if defined but not an object', function () {
            deepMapKeys.bind(null, { one: 1 }, caps, 42).should.throw(TypeError);
        });
        describe('option: thisArg', function () {
            it('sets context within @mapFn', function () {
                deepMapKeys({ one: 1, arr: [2, 3] }, caps, { thisArg: 42 });
                caps.should.have.been.calledOn(42);
            });
            it('defaults to undefined', function () {
                deepMapKeys({ one: 1, arr: [2, 3] }, caps);
                caps.should.have.been.calledOn(undefined);
            });
        });
    });
});
//# sourceMappingURL=index.test.js.map