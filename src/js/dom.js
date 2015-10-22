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
	renderPage = require("./page");

function DOM () {
	if ( !(this instanceof DOM) ) {
		return new DOM();
	}
	this.state = {
		fullPage: true,
		cheatSheet: false,
		addingContent: false,
		level: 0,
		path: ""
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
	this.navDOM = ( this.navDOM && navOld ) ? this.navDOM : (( pages.options.hideNavWhileEditing && this.state.fullPage ) ? renderNav(this) : null);
	this.tabsDOM = ( this.tabsDOM && tabsOld ) ? this.tabsDOM : renderTabs(this);
	return renderPage(this.navDOM, this.tabsDOM, this);
};

DOM.prototype.init = function () {
	var wrapper = phWrapper || document.getElementById("wrapper") || document.getElementById("ph-wrapper");

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

	if ( misc.codeMirror ) {
		this.initEditor();
	}
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

	if ( this.editor && ( !nav || !tabs ) ) {
		this.editor.setValue(pages.current.text);
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
				var saveButton = document.getElementById("ph-save");
				if ( !misc.inTransition.tempSaveText ) {
					pages.current.savePage(saveButton);
				}
			}
		}
	});
	this.editor.on("change", function ( e ) {
		var val = e.getValue();
		pages.current.set({
			text: val
		});
		self.renderOut(val, pages.current.type);
	});
	this.editor.refresh();
};

DOM.prototype.renderOut = function ( text, type ) {
	var regLink = /<a (href="https?:\/\/)/gi;
	type = ( this.state.level > 1 ) ? "## " + type + "\n" : "";
	this.output.innerHTML = misc.md.render(type + text).replace(regLink, "<a target='_blank' $1");
};

var dom = new DOM();

module.exports = dom;
