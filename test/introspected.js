var tressa = tressa || require('tressa');

const fill = Array.prototype.fill;
delete Array.prototype.fill;
var Introspected = Introspected || require('../introspected.js');
Array.prototype.fill = fill;

tressa.title('Introspected');

tressa.assert(Object.getPrototypeOf(Introspected({})) === Introspected.prototype, 'is a Introspected object');
tressa.assert(typeof Introspected({}), 'is an object');
tressa.assert(Array.isArray(Introspected([])), 'is an array');
tressa.assert('' == Introspected({}).any, 'is an empty string');
tressa.assert(typeof Introspected({}, console.log), 'is an observable object');
tressa.assert(typeof Introspected([], console.log), 'is an observable array');

const abusedObject = (o) => {
  o.a.b.c = {};
  o.a.b.c.d = 'd';
  o.b = 123;
  o.c = [1, 2, 3];
  o.d = [{a: 'a'}, [1, 2]];
  o.d[0].b = 'b';
  o.d[1].push(3);
  return o;
};

let o = abusedObject(Introspected({}));
let oStringified = '{"a":{"b":{"c":{"d":"d"}}},"b":123,"c":[1,2,3],"d":[{"a":"a","b":"b"},[1,2,3]]}';
tressa.assert(JSON.stringify(o) === oStringified, 'JSON.stringify(object)');
tressa.assert(JSON.stringify(o.toJSON()) === oStringified, 'JSON.stringify(object.toJSON())');

o = abusedObject(Introspected({gotcha: {}}, () => {}));
oStringified = '{"gotcha":{},"a":{"b":{"c":{"d":"d"}}},"b":123,"c":[1,2,3],"d":[{"a":"a","b":"b"},[1,2,3]]}';
tressa.assert(JSON.stringify(o) === oStringified, 'JSON.stringify(object)');
tressa.assert(JSON.stringify(o.toJSON()) === oStringified, 'JSON.stringify(object.toJSON())');
tressa.assert(o.gotcha.a.b.c.toString() === '', 'initial objects promoted');

tressa.assert(Introspected.pathValue(o, ['d', 1, 1]) === 2, 'path can be retrieved');
tressa.assert(Introspected.pathValue(o, ['n', 'o', 'p', 'e']) === void 0, 'path can be undefined');
tressa.assert(o.d[1].push(4) === 4, 'nested arrays notify');
const d = o.d;
o.d = o.d;
tressa.assert(o.d === d, 'same value no effect');
tressa.assert(o.a.b.c.z + '' === '', 'non set values are empty strings');
tressa.assert(o.a.b.c.z.toString() === '', 'toString() is always usable');
tressa.assert('nope' in o === false, 'if not there, it is a false');

const empty = Introspected();
tressa.assert(JSON.stringify(empty) === '{}', 'empty Introspecteds are allowed');
tressa.assert(Introspected.observe(empty) === empty, 'if observed was a Introspected no wrap');

const abusedArray = (a) => {
  a.push({a: {b: {c: 'c'}}}, 1, 2, [1, 2, 3]);
  a[0].d = 'd';
  a[3].push({a: 'a'});
  return a;
};

let a = abusedArray(Introspected([]));
tressa.assert(JSON.stringify(a) === '[{"a":{"b":{"c":"c"}},"d":"d"},1,2,[1,2,3,{"a":"a"}]]');

o = Introspected({a: a, empty: empty});
tressa.assert(o.a === a, 'a was not wrapped');
tressa.assert(o.empty === empty, 'neither was empty');

o = Introspected({any: 123}, (root, path) => {
  tressa.assert(path.join('') === 'any', 'deleted path');
});
delete o.any;
delete o.nope;



tressa.end();

if (!tressa.exitCode && typeof document !== 'undefined') {
  document.body.style.backgroundColor = '#0FA';
}