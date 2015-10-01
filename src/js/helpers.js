function addEvent ( evt, element, fnc ) {
	return ((element.addEventListener) ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc));
}

function removeEvent ( evt, element, fnc ) {
	return ((element.removeEventListener) ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc));
}

var md = markdownit({
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
	}),
	inTransition = {},
	codeMirror;

try {
	codeMirror = CodeMirror;
} catch (e) {
	codeMirror = null;
}

module.exports = {
	addEvent: addEvent,
	removeEvent: removeEvent,
	regFullPage: regFullPage,
	regCheatSheet: regCheatSheet,
	regNoChange: regNoChange,
	md: md,
	inTransition: inTransition,
	codeMirror: codeMirror
};
