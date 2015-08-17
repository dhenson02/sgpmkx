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

var regLoading = / ?loading/gi,
  regFullPage = / ?fullPage/gi,
  regCheatSheet = / ?cheatSheet/gi,
  regNoChange = / ?nochange/gi,
  md = markdownit({
    xhtmlOut: true,
    typographer: true,
    quotes: '“”‘’',
    highlight: function ( code, lang ) {
      if ( lang && hljs.getLanguage(lang) ) {
        try {
          return hljs.highlight(lang, code).value;
        }
        catch ( e ) {
        }
      }
      return '';
    }
  });

module.exports = {
  addEvent: addEvent,
  removeEvent: removeEvent,
  connError: connError,
  regLoading: regLoading,
  regFullPage: regFullPage,
  regCheatSheet: regCheatSheet,
  regNoChange: regNoChange,
  md: md
};
