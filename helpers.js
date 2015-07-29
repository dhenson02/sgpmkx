module.exports = {
  regLoading: / ?loading/g,
  regFullPage: / ?fullPage/g,
  regCheatSheet: / ?cheatSheet/g,
  regNoChange: / ?nochange/g,
  md: markdownit({
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
  }),
  addEvent: function ( evt, element, fnc ) {
    return ((element.addEventListener) ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc));
  },
  removeEvent: function ( evt, element, fnc ) {
    return ((element.removeEventListener) ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc));
  },
  connError: function ( error ) {
    console.log("error connecting:", error);
  }
};

