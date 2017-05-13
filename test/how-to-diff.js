// grab from the live test page or require in node
var Introspected = Introspected || require('../introspected.js');

// any JSON compliant data structure
const source = {
  name: 'anonymous',
  age: 0,
  address: {
    street: '',
    city: '',
    country: ''
  }
};

// an Introspected version of the same data
// any operation will be known, no way to hide changes!
const intr = Introspected(source, (intr, path) => {

  // walk through the source
  let src = source;

  // ensure objects/dictionaries won't throw
  let hOP = {}.hasOwnProperty;
  
  // loop over the whole path
  for (let sub = [], i = 0; i < path.length; i++) {

    // grab current property, add it to sub-path
    let prop = (sub[i] = path[i]);

    // if the property is unknown
    if (!hOP.call(src, prop)) {

      // this means it was added
      console.log('added ' + sub.join('.'));

      // assign it from the intr
      src[prop] = intr[prop];
    }
    // if the prop is in the current intr object
    else if (prop in intr) {
      // this means it was changed
      console.log('changed ' + sub.join('.'));
      // There is no need to check src[prop] === intr[prop]
      // because Introspected notifies changes *only* when
      // the new value is different from the previous one.
    }
    // if property is not in the intr object
    else {
      // it means it was removed
      delete src[prop];
      console.log('removed ' + sub.join('.'));
      // no need to keep walking through
      // or accessing intr[prop] will set it again
      break; // or return;
    }
    src = src[prop];
    intr = intr[prop];
  }
});

// change few fields
intr.name = 'Andrea';
intr.age = 39;

// change a nested group
intr.address = {
  street: 'Wenlock',
  city: 'London',
  country: 'UK'
};

// add new field
intr.nationality = 'italian';

// add nested property
intr.address.postcode = 'N1';

// remove a property
delete intr.address.street;

// no notification will happen
// because it's the same value
intr.age = 39;

// re set removed field
intr.address.street = 'Archway';
