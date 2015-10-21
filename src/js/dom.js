var vdom = require("virtual-dom/dist/virtual-dom"),
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
		path: "/",
		subMenu: ""
	};
}

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
};

DOM.prototype.preRender = function () {
	this.navDOM = ( pages.options.hideNavWhileEditing && this.state.fullPage ) ? renderNav(this) : null;
	this.tabsDOM = renderTabs(this);
	return renderPage(this.navDOM, this.tabsDOM, this);
};

DOM.prototype.set = function ( data, ctx ) {
	ctx = ctx || this;
	for ( var name in data ) {
		if ( ctx.hasOwnProperty(name) ) {
			ctx[name] = data[name];
		}
	}
};

DOM.prototype.setState = function ( data ) {
	this.set(data, this.state);
	this.update();
};

DOM.prototype.update = function () {
	var refreshDOM = this.preRender(),
		patches = diff(this.dirtyDOM, refreshDOM);

	this.rootNode = patch(this.rootNode, patches);
	this.dirtyDOM = refreshDOM;

	if ( this.editor ) {
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
	type = ( pages.current.level > 1 ) ? "## " + type + "\n" : "";
	this.output.innerHTML = misc.md.render(type + text).replace(regLink, "<a target='_blank' $1");
};

/*DOM.prototype.resetEditor = function () {
	if ( this.editor ) {
		var wrap = this.editor.getWrapperElement();
		wrap.parentNode.removeChild(wrap);
	}
	this.editor = null;
};*/

var dom = new DOM();

module.exports = dom;
