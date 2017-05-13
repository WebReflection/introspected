"use strict";

// grab from the live test page or require in node
var Introspected = Introspected || require('../introspected.js');

class Foo {
  constructor() {
    this.state = Introspected({}, console.log);
    this.state.items = [
      {id: 1, text: "foo"},
      {id: 2, text: "bar"},
      {id: 3, text: "baz"}
    ];
  }
  add(newItem) {
    this.state.items.push(newItem);
  }
}

const foo = new Foo();
foo.add({ id: 4, text: "minions" });

console.log(foo.state);

