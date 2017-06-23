/*! (c) Andrea Giammarchi - @WebReflection - ISC License */
var Introspected = ((O) => {'use strict';

  // commonly needed shortcuts
  const SProto = Introspected.prototype;
  const toString = O.prototype.toString;
  const create = O.create;
  const defineProperties = O.defineProperties;
  const emptyArray = [];
  const emptyString = () => '';
  const getPrototypeOf = O.getPrototypeOf;
  const isArray = Array.isArray;
  const keys = O.keys;
  const toPrimitive = Symbol.toPrimitive;

  // weakly holds all known references
  // avoid useless Proxies when already known
  const known = new WeakMap();

  // triggered on Array changes
  const ArrayHandler = [
    'copyWithin',
    'fill',
    'pop',
    'push',
    'reverse',
    'shift',
    'sort',
    'splice',
    'unshift'
  ].reduce((properties, method) => {
    const fn = emptyArray[method];
    if (fn) properties[method] = {
      value() {
        const result = fn.apply(this, arguments);
        const length = this.length;
        const info = known.get(this);
        for (let i = 0; i < length; i++) {
          const value = this[i];
          if (typeof value === 'object' && value != null) {
            setValue(info.O, this, info.$, i, value);
          }
        }
        info.O(emptyArray);
        return result;
      }
    };
    return properties;
  }, {});

  // each Introspected is proxied through this handler
  const IntrospectedHandler = {
    // notify if necessary
    deleteProperty(target, prop) {
      if (prop in target && delete target[prop] && known.has(target)) {
        known.get(target).O(prop);
      }
      return true;
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
          const info = known.get(target);
          return (target[prop] = register(
            info.O,
            create(null),
            info.$.concat(prop)
          )._);
      }
    },
    // triggers only on actual changes
    set(target, prop, value) {
      if ((prop in target ? target[prop] : void 0) !== value) {
        const info = known.get(target);
        setValue(info.O, target, info.$, prop, value);
        info.O(prop);
      }
      return true;
    }
  };

  function importArray(observer, value, path) {
    const length = value.length;
    const target = Array(length);
    for (let i = 0; i < length; i++) {
      setValue(observer, target, path, i, value[i]);
    }
    return register(observer, target, path);
  }

  function importObject(observer, value, path) {
    const properties = keys(value);
    const length = properties.length;
    const target = create(null);
    for (let prop, i = 0; i < length; i++) {
      prop = properties[i];
      setValue(observer, target, path, prop, value[prop]);
    }
    return register(observer, target, path);
  }

  function register(observer, target, paths) {
    const info = {
      _: wrap(target),
      $: paths,
      O: observer
    };
    known.set(target, info);
    return info;
  }

  function setValue(observer, target, path, prop, value) {
    if (isArray(value)) {
      target[prop] = (
        known.get(value) ||
        importArray(observer, value, path.concat(prop))
      )._;
    } else if(typeof value === 'object' && value != null) {
      const object = getPrototypeOf(value) === SProto ?
                      value.toJSON() : value;
      target[prop] = toString.call(object) === '[object Date]' ?
        object : (
          known.get(object) ||
          importObject(observer, object, path.concat(prop))
        )._;
    } else {
      target[prop] = value;
    }
  }

  function wrap(target) {
    return isArray(target) ?
      defineProperties(target, ArrayHandler) :
      new Proxy(target, IntrospectedHandler);
  }

  function Introspected(target, callback) {
    const isNull = target == null;
    if (isNull || (
      getPrototypeOf(target) !== SProto &&
      !known.has(target)
    )) {
      const root = isNull || !isArray(target) ? create(null) : [];
      const info = register(
        function (path) {
          const paths = this.$.concat(path);
          info.O.$.forEach(fn => fn(info._, paths));
        },
        root,
        emptyArray
      );
      info.O.$ = new Set();
      if (!isNull) keys(target).forEach(
        prop => setValue(info.O, root, emptyArray, prop, target[prop])
      );
      if (callback) {
        info.O.$.add(callback);
        callback(info._, []);
      }
      return info._;
    } else {
      if (callback) {
        known.get(target.toJSON()).O.$.add(callback);
        // don't notify other callbacks since no change was made
        callback(target, []);
      }
      return target;
    }
  }

  Introspected.observe = Introspected;

  Introspected.pathValue = (model, path) =>
    path.reduce((m, p) => (m && p in m) ? m[p] : void 0, model);

  return Introspected;

})(Object);

try { module.exports = Introspected; } catch(o_O) {}
