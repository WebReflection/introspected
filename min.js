/*! (c) Andrea Giammarchi - @WebReflection - ISC License */
var Introspected=(()=>{"use strict";function t(c,r){return 2===arguments.length?t.observe(c,r):c?a(c)?n(null,c,[]):e(null,c,[]):o(s(null),[])}function n(t,n,e){const o=n.length,s=Array(o);y.set(r(s,t),e);for(let r=0;r<o;r++)c(t,s,e,r,n[r]);return i(s,d)}function e(t,n,e){const i=l(n),u=i.length,f=r(s(null),t);for(let o=0;o<u;o++){let r=i[o];c(t,f,e,r,n[r])}return o(f,e)}function o(t,n){return y.set(t,n),new Proxy(t,b)}function c(t,o,c,s,i){if(a(i))o[s]=y.has(i)?r(i,t):n(t,i,c.concat(s));else if(i&&"object"==typeof i){let n=f(i)===h?i.toJSON():i;o[s]=y.has(n)?(r(n,t),i):e(t,i,c.concat(s))}else o[s]=i}function r(t,n){return n&&g.set(t,n),t}const s=Object.create;const i=Object.defineProperties;const u=()=>"";const f=Object.getPrototypeOf;const a=Array.isArray;const l=Object.keys;const h=t.prototype;const p=Symbol.toPrimitive;const g=new WeakMap;const y=new WeakMap;const d=["copyWithin","fill","pop","push","reverse","shift","sort","splice","unshift"].reduce((t,n)=>{const e=Array.prototype[n];e&&(t[n]={value:function(...t){const n=e.apply(this,t),o=this.length,r=y.get(this),s=g.get(this);for(let t=0;t<o;t++){const n=this[t];n&&"object"==typeof n&&c(s,this,r,t,n)}return s&&s.$(r),n}});return t},{});const b={deleteProperty(t,n){n in t&&delete t[n]&&g.has(t)&&g.get(t).$(y.get(t).concat(n))},getPrototypeOf(){return h},has(t,n){return n in t},get(t,n){switch(!0){case n in t:return t[n];case n===p:case"toString"===n:return u;case"toJSON"===n:return()=>t;default:const e=t[n]=o(s(null),y.get(t).concat(n));return r(e.toJSON(),g.get(t)),e}},set(t,n,e){if((n in t?t[n]:void 0)!==e){const o=y.get(t),r=g.get(t);c(r,t,o,n,e),r&&r.$(o.concat(n))}return!0}};t.observe=((n,e)=>{const o=f(n)===h?n:t(n);const r=a(o)?o:o.toJSON();const s=g.get(r)||{$:t=>s.fn.forEach(n=>n(o,t)),fn:[]};s.fn.push(e);g.set(r,s);l(r).forEach(t=>c(s,r,[],t,r[t]));return o});t.pathValue=((t,n)=>n.reduce((t,n)=>t&&n in t?t[n]:void 0,t));return t})();try{module.exports=Introspected}catch(t){}