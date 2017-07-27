# Introspected

[![Build Status](https://travis-ci.org/WebReflection/introspected.svg?branch=master)](https://travis-ci.org/WebReflection/introspected) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/introspected/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/introspected?branch=master) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/WebReflection/donate)

[Medium presentation post](https://medium.com/@WebReflection/introspected-js-objects-without-secrets-55cf0bd3dccc)
- - -

If you'd like to be notified about any possible change that could happen to a JSON compatible model / data / object / array / structure,
including the possibility to retrieve the exact full path of the object that changed and eventually walk through it,
you've reached your destination.

```js
const data = Introspected(
  // any object or JSON compatible structure
  // even with nested properties, objects, arrays
  JSON.parse('{}'),
  (root, path) => {
    // the root object that changed
    console.log(root);
    // the path that just changed
    console.log(path);
  }
);

// now try the following in console
data.a.b.c.d.e.f.g = 'whatever';
data.array.value = [1, 2, 3];
data.array.value.push(4);
// see all notifications about all changes 🎉

JSON.stringify(data);
// {"a":{"b":{"c":{"d":{"e":{"f":{"g":"whatever"}}}}}},"array":{"value":[1,2,3,4]}}
```


# API

  * `Introspected(objectOrArray[, callback])` create a new `Introspected` object capable of having infinite depth without ever throwing errors
  * `Introspected.observe(objectOrArray, callback)` crate a `Introspected` with a notifier per each change, or set a notifier per each change to an existent `Introspected` object
  * `Introspected.pathValue(objectOrArray, path)` walk through an object via a provided path. A `path` is an `Array` of properties, it is usually the one received through the notifier whenever a `Introspected` object is **observed**.


# Compatibility

Any spec compliant ES2015 JavaScript engine.

<sup>(that means native `WeakMap`, `Proxy` and `Symbol.toPrimitive` too)</sup>

[Live test page](https://webreflection.github.io/introspected/)

**Working:** NodeJS 6+, Chrome, Safari, GNOME Web, Edge, Firefox, Samsung Internet (Chrome 51)

**Not there yet:** UC Browser (WebKit 534)


## ISC License

