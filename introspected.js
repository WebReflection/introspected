/*! (c) Andrea Giammarchi - @WebReflection - ISC License */
var Introspected = (() => {'use strict';

  // commonly needed shortcuts
  const create = Object.create;
  const defineProperties = Object.defineProperties;
  const emptyString = () => '';
  const getPrototypeOf = Object.getPrototypeOf;
  const isArray = Array.isArray;
  const keys = Object.keys;
  const SProto = Introspected.prototype;
  const toPrimitive = Symbol.toPrimitive;

  // holds all paths as Arrays
  const observed = new WeakMap();
  // holds all observables
  const paths = new WeakMap();

  // triggered on Array changes
  const ArrayHandler = [
    "copyWithin",
    "fill",
    "pop",
    "push",
    "reverse",
    "shift",
    "sort",
    "splice",
    "unshift"
  ].reduce((properties, method) => {
    const fn = Array.prototype[method];
    if (fn) properties[method] = {
      value: function (...args) {
        const result = fn.apply(this, args);
        const length = this.length;
        const path = paths.get(this);
        const observe = observed.get(this);
        for (let i = 0; i < length; i++) {
          const value = this[i];
          if (value && typeof value === 'object') {
            setValue(observe, this, path, i, value);
          }
        }
        if (observe) observe.$(path);
        return result;
      }
    };
    return properties;
  }, {});

  // each Introspected is proxied through this handler
  const IntrospectedHandler = {
    // notify if necessary
    deleteProperty(target, prop) {
      if (prop in target && delete target[prop] && observed.has(target)) {
        observed.get(target).$(paths.get(target).concat(prop));
      }
    },
    // return the correct prototype
    getPrototypeOf() {
        return SProto;
    },
    // the check to do to know if a path exists
    has(target, prop) {
        return prop in target;
    },
    // returns proxied model or create an empty one
    get(target, prop) {
      switch (true) {
        case prop in target:
          return target[prop];
        case prop === toPrimitive:
        case prop === 'toString':
          return emptyString;
        case prop === 'toJSON':
          return () => target;
        default:
          const proxy = (target[prop] = proxyIntrospected(
            create(null),
            paths.get(target).concat(prop)
          ));
          withObserver(proxy.toJSON(), observed.get(target));
          return proxy;
      }
    },
    // triggers only on actual changes
    set(target, prop, value) {
      if ((prop in target ? target[prop] : void 0) !== value) {
        const path = paths.get(target);
        const observe = observed.get(target);
        setValue(observe, target, path, prop, value);
        if (observe) observe.$(path.concat(prop));
      }
      return true;
    }
  };

  function Introspected(from, callback) {
    return arguments.length === 2 ?
      Introspected.observe(from, callback) :
      (from ?
        (isArray(from) ?
          importArray(null, from, []) :
          importObject(null, from, [])
        ) :
        proxyIntrospected(create(null), []));
  }

  function importArray(observe, value, path) {
    const length = value.length;
    const target = Array(length);
    paths.set(withObserver(target, observe), path);
    for (let i = 0; i < length; i++) {
      setValue(observe, target, path, i, value[i]);
    }
    return defineProperties(target, ArrayHandler);
  }

  function importObject(observe, value, path) {
    const properties = keys(value);
    const length = properties.length;
    const target = withObserver(create(null), observe);
    for (let i = 0; i < length; i++) {
      let prop = properties[i];
      setValue(observe, target, path, prop, value[prop]);
    }
    return proxyIntrospected(target, path);
  }

  function proxyIntrospected(target, path) {
    paths.set(target, path);
    return new Proxy(target, IntrospectedHandler);
  }

  function setValue(observe, target, path, prop, value) {
    if (isArray(value)) {
      target[prop] = paths.has(value) ?
        withObserver(value, observe) :
        importArray(observe, value, path.concat(prop));
    } else if(value && typeof value === 'object') {
      let object = getPrototypeOf(value) === SProto ? value.toJSON() : value;
      target[prop] = paths.has(object) ?
        (withObserver(object, observe), value) :
        importObject(observe, value, path.concat(prop));
    } else {
      target[prop] = value;
    }
  }

  function withObserver(target, observe) {
    if (observe) observed.set(target, observe);
    return target;
  }

  Introspected.observe = (m, callback) => {
    const proxy = getPrototypeOf(m) === SProto ? m : Introspected(m);
    const target = isArray(proxy) ? proxy : proxy.toJSON();
    const observe = observed.get(target) ||
      {$: path => observe.fn.forEach(fn => fn(proxy, path)), fn: []};
    observe.fn.push(callback);
    observed.set(target, observe);
    keys(target).forEach(prop =>
      setValue(observe, target, [], prop, target[prop]));
    return proxy;
  };

  Introspected.pathValue = (model, path) =>
    path.reduce((m, p) => (m && p in m) ? m[p] : void 0, model);

  return Introspected;

})();

try { module.exports = Introspected; } catch(o_O) {}
