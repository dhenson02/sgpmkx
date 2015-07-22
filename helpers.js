var regLoading = / ?loading/g,
  regFullPage = / ?fullPage/g,
  regCheatSheet = / ?cheatSheet/g,
  regNoChange = / ?nochange/g,
  md = markdownit({
    highlight: function ( code, lang ) {
      if ( lang && hljs.getLanguage(lang) ) {
        try {return hljs.highlight(lang, code).value;} catch ( e ) {}
      } return '';}
  });

if (!Object.keys) {
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
String.prototype.toCamelCase = function() {
  return this
    .toLowerCase()
    .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
    //.replace(/^(.)/, function($1) { return $1.toLowerCase(); })
    .replace(/\s/g, '');
};
function addEvent ( evt, element, fnc ) {
  return ((element.addEventListener) ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc));
}
function removeEvent ( evt, element, fnc ) {
  return ((element.removeEventListener) ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc));
}
function connError ( error ) {
  console.log("error connecting:", error);
}
