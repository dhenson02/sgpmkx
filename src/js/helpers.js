function addEvent ( evt, element, fnc ) {
	return ((element.addEventListener) ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc));
}

function removeEvent ( evt, element, fnc ) {
	return ((element.removeEventListener) ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc));
}

var markdownit = require("markdown-it"),
	md = markdownit({
		typographer: true,
		linkify: true,
		breaks: true,
		xhtmlOut: true,
		quotes: '“”‘’'
	}),
	inTransition = {
		output: false,
		tempSaveText: null,
		tab: false
	},
	clicked = -1,
	codeMirror = CodeMirror,
	regSplit = /; *|, *| \b|\b /g,
	//regSplit = /\s/g,
	regPubs = regPubs = /\d* ?[-_a-z]+[\s\.\-]*[0-9]+(?:-|\.)[0-9]+(?:_?sup[a-z]*)?/gi;

module.exports = {
	addEvent: addEvent,
	removeEvent: removeEvent,
	md: md,
	inTransition: inTransition,
	clicked: clicked,
	codeMirror: codeMirror,
	regSplit: regSplit,
	regPubs: regPubs
};
