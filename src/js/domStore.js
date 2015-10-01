var h = require("virtual-dom/h"),
	diff = require("virtual-dom/diff"),
	patch = require("virtual-dom/patch"),
	createElement = require("virtual-dom/create-element"),
	renderPage = require("./page").render,
	renderEditor = require("./page").editor,
	codeMirror = require("./helpers").codeMirror,
	pages = require("./store").pages,
	events = require("./store").events,
	current = pages.current;

function DOM () {
	if ( !(this instanceof DOM) ) {
		return new DOM();
	}

	this.dirtyDOM = ( !codeMirror ) ?
		renderPage() :
		renderEditor();
	this.rootNode = createElement(this.dirtyDOM);

}

DOM.prototype.set = function ( data ) {
	var name;
	for ( name in data ) {
		if ( this.hasOwnProperty(name) ) {
			this[name] = data[name];
		}
	}
	return this;
};

DOM.prototype.init = function () {
	var el = document.getElementById("ph-wrapper");
	el.parentNode.replaceChild(this.rootNode, el);
	this.reset();
};

DOM.prototype.render = function ( cfg ) {
	cfg = {
		nav: cfg.nav || Nav.cfg
	};
	var refreshDOM = ( !codeMirror ) ?
		renderPage(cfg) :
		renderEditor(cfg);
	var patches = diff(this.dirtyDOM, refreshDOM);
	this.rootNode = patch(this.rootNode, patches);
	this.dirtyDOM = refreshDOM;
	this.reset();
};

DOM.prototype.reset = function () {
	this.content = document.getElementById("ph-content");
	this.title = document.getElementById("ph-title");
	this.buttons = document.getElementById("ph-buttons");
	//this.contentWrap = document.getElementById("ph-contentWrap");
	this.cheatSheet = document.getElementById("cheatSheet");
	this.input = document.getElementById("ph-input");
	this.textarea = document.getElementById("ph-textarea");
	this.editor = null;
	this.output = document.getElementById("ph-output");
};

var dom = new DOM();

events.on("tab.change", function ( page ) {
	var content = {};
	content[current.type.toLowerCase()] = current.text;
	content.text = current[page.toLowerCase()];
	content.type = page;
	current.set(content);
	insertContent(current.text, current.type);
	if ( codeMirror ) {
		setupEditor();
	}
});

module.exports = dom;
