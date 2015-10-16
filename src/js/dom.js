var h = require("virtual-dom/h"),
	diff = require("virtual-dom/diff"),
	patch = require("virtual-dom/patch"),
	createElement = require("virtual-dom/create-element"),
	misc = require("./helpers"),
	codeMirror = misc.codeMirror,
	pages = require("./pages"),
	events = require("./events"),
	renderPage = require("./page"),
	renderNav = require("./nav"),
	renderTabs = require("./tabs");

function DOM () {
	if ( !(this instanceof DOM) ) {
		return new DOM();
	}
	this.state = {
		fullPage: true,
		cheatSheet: false,
		addingContent: false,
		level: 0
	};
}

DOM.prototype.set = function ( data ) {
	var name;
	for ( name in data ) {
		if ( this.hasOwnProperty(name) ) {
			if ( name !== "state" ) {
				this[name] = data[name];
			}
			else {
				var opt;
				for ( opt in data.state ) {
					if ( this.state.hasOwnProperty(opt) ) {
						this.state[opt] = data.state[opt];
					}
				}
				this.loadContent();
			}
		}
	}
	return this;
};

DOM.prototype.preRender = function () {
	this.navDOM = ( this.state.fullPage ) ? renderNav() : null;
	this.tabsDOM = ( this.state.addingContent === false && misc.inTransition.output === false ) ? renderTabs() : null;
	return renderPage(this.navDOM, this.tabsDOM, this);
};

DOM.prototype.init = function () {
	var wrapper = phWrapper || document.getElementById("wrapper") || document.getElementById("ph-wrapper");
	this.dirtyDOM = this.preRender();
	this.rootNode = createElement(this.dirtyDOM);
	wrapper.parentNode.replaceChild(this.rootNode, wrapper);
	this.searchInput = document.getElementById("ph-search");
	this.content = document.getElementById("ph-content");
	this.title = document.getElementById("ph-title");
	this.cheatSheet = document.getElementById("cheatSheet");
	this.textarea = document.getElementById("ph-textarea");
	this.output = document.getElementById("ph-output");
	this.reset();
};

DOM.prototype.loadContent = function  () {
	if ( this.state.fullPage && !pages.current[pages.current._type] ) {
		events.emit("tab.change", "Overview");
	}
	var refreshDOM = this.preRender();
	var patches = diff(this.dirtyDOM, refreshDOM);
	this.rootNode = patch(this.rootNode, patches);
	this.dirtyDOM = refreshDOM;
	if ( codeMirror ) {
		this.reset();
		if ( !this.state.fullPage ) {
			this.initEditor();
		}
	}
};

DOM.prototype.reset = function () {
	if ( this.editor ) {
		var wrap = this.editor.getWrapperElement();
		wrap.parentNode.removeChild(wrap);
	}
	this.editor = null;
};

DOM.prototype.initEditor = function () {
	var self = this;
	this.editor = codeMirror.fromTextArea(this.textarea, {
		mode: 'gfm',
		matchBrackets: true,
		lineNumbers: false,
		lineWrapping: true,
		lineSeparator: "\n",
		theme: phEditorTheme,
		extraKeys: {
			"Enter": "newlineAndIndentContinueMarkdownList",
			"Ctrl-S": function () {
				var saveButton = document.getElementById("ph-save");
				if ( !misc.inTransition.tempSaveText ) pages.current.savePage(saveButton)
			}
		}
	});
	this.editor.on("change", function ( e ) {
		var val = e.getValue();
		self.renderOut(val, pages.current.type);
		pages.current.set({
			text: val
		});
	});
	this.editor.refresh();
};

DOM.prototype.renderOut = function ( text, type ) {
	var regLink = /<a (href="https?:\/\/)/gi;
	type = ( pages.current.level > 1 ) ? "## " + type + "\n" : "";
	this.output.innerHTML = misc.md.render(type + text).replace(regLink, "<a target='_blank' $1");
};

var dom = new DOM();

module.exports = dom;
