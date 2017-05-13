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
const naked = Introspected(source, (naked, path) => {

  // walk through the source
  let src = source;
  let nkd = naked;

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

      // assign it from the naked
      src[prop] = nkd[prop];
    }
    // if the prop is in the current naked object
    else if (prop in nkd) {
      // this means it was changed
      console.log('changed ' + sub.join('.'));
      // There is no need to check src[prop] === nkd[prop]
      // because Introspected notifies changes *only* when
      // the new value is different from the previous one.
    }
    // if property is not in the naked object
    else {
      // it means it was removed
      delete src[prop];
      console.log('removed ' + sub.join('.'));
      // no need to keep walking through
      // or accessing naked[prop] will set it again
      break; // or return;
    }
    src = src[prop];
    nkd = nkd[prop];
  }
});

// change few fields
naked.name = 'Andrea';
naked.age = 39;

// change a nested group
naked.address = {
  street: 'Wenlock',
  city: 'London',
  country: 'UK'
};

// add new field
naked.nationality = 'italian';

// add nested property
naked.address.postcode = 'N1';

// remove a property
delete naked.address.street;

// no notification will happen
// because it's the same value
naked.age = 39;

// re set removed field
naked.address.street = 'Archway';
