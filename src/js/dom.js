var vdom = require("virtual-dom"),
	h = vdom.h,
	diff = vdom.diff,
	patch = vdom.patch,
	createElement = vdom.create,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events"),
	renderNav = require("./nav"),
	renderTabs = require("./tabs"),
	renderPage = require("./page"),
	regLink = /<a (href=["']https?:\/\/)/gi;

function DOM () {
	if ( !(this instanceof DOM) ) {
		return new DOM();
	}
	this.state = {
		fullPage: true,
		cheatSheet: false,
		addingContent: false,
		level: null,
		path: "",
		nextPath: "",
		nextLevel: null,
		nextParent: "",
		opened: {},
		parent: "",
		tab: "",
		revertScroll: 254,
		tagsChanging: false,
		titleChanging: false,
		titleStyle: {},
		contentChanging: false,
		saveText: "Save",
		saveStyle: {}
	};
}
/**
 * Begins rendering the virtual-dom VTree.  Determines what needs to render
 * and what doesn't.
 * @param navOld - BOOLEAN: if old navDOM tree should still be used
 * @param tabsOld - BOOLEAN: if old tabsDOM tree should still be used
 * @returns {*} - VTree, VNode or...null?
 */
DOM.prototype.preRender = function ( navOld, tabsOld ) {
	this.navDOM = ( this.navDOM && navOld ) ? this.navDOM : (( this.state.fullPage && pages.options.hideNavWhileEditing ) ? renderNav(this) : null);
	this.tabsDOM = ( this.tabsDOM && tabsOld ) ? this.tabsDOM : renderTabs(this);
	this.inputDOM = null;
	this.outputDOM = null;
	return renderPage(this);
};

DOM.prototype.init = function () {
	var wrapper = phWrapper || document.getElementById("wrapper") || document.getElementById("ph-wrapper") || document.getElementById("ph-root");

	this.dirtyDOM = this.preRender();
	this.rootNode = createElement(this.dirtyDOM);
	wrapper.parentNode.replaceChild(this.rootNode, wrapper);

	this.editor = null;
	this.searchInput = document.getElementById("ph-search");
	this.content = document.getElementById("ph-content");
	this.title = document.getElementById("ph-title");
	this.cheatSheet = document.getElementById("cheatSheet");
	this.textarea = document.getElementById("ph-textarea");
	this.output = document.getElementById("ph-output");

	events.emit("dom.loaded");
};

DOM.prototype.set = function ( data, ctx ) {
	ctx = ctx || this;
	for ( var name in data ) {
		if ( ctx.hasOwnProperty(name) ) {
			ctx[name] = data[name];
		}
	}
};

DOM.prototype.setState = function ( data, nav, tabs ) {
	this.set(data, this.state);
	this.update(nav, tabs);
};

DOM.prototype.update = function ( nav, tabs ) {
	var refreshDOM = this.preRender(nav, tabs),
		patches = diff(this.dirtyDOM, refreshDOM);

	this.rootNode = patch(this.rootNode, patches);
	this.dirtyDOM = refreshDOM;

	if ( this.editor && ( !tabs ) ) {
		this.editor.setValue(pages.current[this.state.tab]);
	}
};

DOM.prototype.initEditor = function () {
	var self = this;
	this.editor = misc.codeMirror.fromTextArea(this.textarea, {
		mode: 'gfm',
		matchBrackets: true,
		lineNumbers: false,
		lineWrapping: true,
		tabSize: 2,
		lineSeparator: "\n",
		theme: phEditorTheme,
		extraKeys: {
			"Enter": "newlineAndIndentContinueMarkdownList",
			"Ctrl-S": function () {
				if ( self.state.saveText === "Save" ) {
					events.emit("content.save");
				}
			}
		}
	});
	this.editor.on("change", function ( e ) {
		pages.current.set(self.state.tab, e.getValue());
		self.renderOut();
	});
	this.editor.refresh();
};

DOM.prototype.renderOut = function () {
	//var type = ( this.state.level > 1 ) ? ( "## " + this.state.tab + "\n" ) : "";
	this.output.innerHTML = misc.md.render(pages.current[this.state.tab]).replace(regLink, "<a target='_blank' $1");
};

var dom = new DOM();

module.exports = dom;
