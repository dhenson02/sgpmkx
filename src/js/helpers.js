function addEvent ( evt, element, fnc ) {
	return ((element.addEventListener) ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc));
}

function removeEvent ( evt, element, fnc ) {
	return ((element.removeEventListener) ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc));
}

const markdownit = require("markdown-it");
const md = markdownit({
    'typographer': true,
    'linkify': true,
    'breaks': true,
    'xhtmlOut': true,
    'quotes': '“”‘’'
});
const codeMirror = CodeMirror;
const regLink = /<a (href=["']https?:\/\/)/gi;
const regSpaces = /\s{2,}/g;
const regSplit = /[^a-zA-Z0-9\/.%_\-: ]+/g;
const regSplit2 = /[^a-zA-Z0-9-_]+/g;
const regSanitize = /([^a-zA-Z0-9-_.&\s]+)/g;
const regPubs = /\d* ?[-_a-z]+[\s\.\-]*[0-9]+(?:-|\.)[0-9]+(?:_?sup[a-z]*)?/gi;
const regPhone = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm;

module.exports = {
	addEvent,
	removeEvent,
	md,
	codeMirror,
	regLink,
	regSpaces,
	regSplit,
	regSplit2,
	regSanitize,
	regPubs,
    regPhone
};
