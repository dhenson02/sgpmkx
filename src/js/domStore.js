var misc = require("./helpers"),
	codeMirror = misc.codeMirror,
	store = require("./store"),
	pages = store.pages,
	events = store.events,
	render = require("./page").render,
	renderEditor = require("./page").editor,
	renderNav = require("./nav"),
	renderTabs = require("./tabs");

function DOM () {
	if ( !(this instanceof DOM) ) {
		return new DOM();
	}
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

DOM.prototype.preRender = function () {
	this.navDOM = renderNav();
	this.tabsDOM = renderTabs();
	return ( !codeMirror ) ?
		render(this.navDOM, this.tabsDOM) :
		renderEditor(this.navDOM, this.tabsDOM, this);
};

DOM.prototype.init = function () {
	var wrapper = document.getElementById("wrapper") || document.getElementById("ph-wrapper");
	this.dirtyDOM = this.preRender();
	this.rootNode = createElement(this.dirtyDOM);
	wrapper.parentNode.replaceChild(this.rootNode, wrapper);
	this.reset();
};

DOM.prototype.update = function  () {
	var refreshDOM = this.preRender();
	var patches = diff(this.dirtyDOM, refreshDOM);
	this.rootNode = patch(this.rootNode, patches);
	this.dirtyDOM = refreshDOM;
	document.title = pages.current.title;
	this.reset();
	if ( codeMirror ) this.initEditor();
};

DOM.prototype.reset = function () {
	this.content = document.getElementById("ph-content");
	this.title = document.getElementById("ph-title");
	//this.buttons = document.getElementById("ph-buttons");
	//this.contentWrap = document.getElementById("ph-contentWrap");
	this.cheatSheet = document.getElementById("cheatSheet");
	this.input = document.getElementById("ph-input");
	this.textarea = document.getElementById("ph-textarea");
	if ( this.editor ) {
		var wrap = this.editor.getWrapperElement();
		wrap.parentNode.removeChild(wrap);
	}
	this.editor = null;
	this.output = document.getElementById("ph-output");
};

DOM.prototype.initEditor = function () {
	console.log("Loading editor...");
	this.editor = codeMirror.fromTextArea(this.textarea, {
		mode: 'gfm',
		lineNumbers: false,
		matchBrackets: true,
		lineWrapping: true,
		theme: "neo",
		extraKeys: { "Enter": "newlineAndIndentContinueMarkdownList" }
	});
	this.editor.on("change", this.updateEditor);
	this.editor.refresh();
	console.log("Editor loaded");
};

DOM.prototype.updateEditor = function ( e ) {
	var val = e.getValue();
	this.renderOut(val, pages.current.type);
	pages.current.set({
		text: val
	});
};

DOM.prototype.renderOut = function ( text, type ) {
	this.output.innerHTML = misc.md.render("## " + type + "\n" + text);
};

var dom = new DOM();

module.exports = dom;
