function addEvent ( evt, element, fnc ) {
	return ((element.addEventListener) ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc));
}

function removeEvent ( evt, element, fnc ) {
	return ((element.removeEventListener) ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc));
}

var md = markdownit({
		typographer: true,
		linkify: true,
		breaks: true,
		quotes: '“”‘’'
	}),
	inTransition = {
		tempSaveText: null
	},
	clicked = -1,
	codeMirror;

try {
	codeMirror = CodeMirror;
} catch (e) {
	codeMirror = null;
}

module.exports = {
	addEvent: addEvent,
	removeEvent: removeEvent,
	md: md,
	inTransition: inTransition,
	clicked: clicked,
	codeMirror: codeMirror
};
