var h = require("virtual-dom/h"),
	pages = require("./pages"),
	events = require("./events"),
	misc = require("./helpers"),
	inTransition = misc.inTransition;

function renderLoader () {
	return (
		h("#ph-loader.loader-group", [
			h(".bigSqr", [
				h(".square.first"),
				h(".square.second"),
				h(".square.third"),
				h(".square.fourth")
			]),
			h(".text", ["loading..."])
		])
	);
}

function renderAddContent () {
	return (
		h("#ph-content.fullPage.adding-content", [
			h("fieldset", [
				h("legend", ["Many things to be added soon"]),
				h("label", [
					"Title",
					h("input.ph-title-input", {
						oninput: function ( e ) {
							return e;
						}
					})
				]),
				h("label", [
					"Name",
					h("input.ph-name-input", {
						oninput: function ( e ) {
							return e;
						}
					})
				]),
				h("label", [
					"Path",
					h("input.ph-path-input", {
						oninput: function ( e ) {
							return e;
						}
					})
				])
			])
		])
	);
}

function renderEditor ( tabsDOM, DOM ) {
	return (
		h("#ph-content" + (DOM.state.fullPage ? ".fullPage" : ""), [
			h("a.ph-toggle-editor", {
				href: "#",
				role: "button",
				onclick: function ( event ) {
					event = event || window.event;
					if ( event.preventDefault ) event.preventDefault();
					else event.returnValue = false;

					DOM.set({
						state: {
							fullPage: !DOM.state.fullPage
						}
					});
				}
			}, [DOM.state.fullPage ? "Show editor" : "Hide editor"]),
			h("h1#ph-title" + ( misc.codeMirror ? ".ph-cm" : "" ), {
				contentEditable: (( misc.codeMirror ) ? true : false ),
				onblur: function () {
					var title = this.textContent || this.innerText;
					title = title.trim();
					pages.current.set({
						title: title
					});
					if ( title !== pages.current._title ) {
						this.style.transition = "border .05s ease-out";
						this.style.borderBottomColor = "#00B16A";
						// 3px double
					}
					else {
						this.removeAttribute("style");
					}
				}
			}, [
				String(pages.current.title || "")
			]),
			tabsDOM,
			h("#ph-buttons", [
				//h(".clearfix"),
				h("a#ph-save.ph-edit-btn.ph-save", {
					href: "#",
					title: "Save",
					onclick: function ( event ) {
						event = event || window.event;
						if ( event.preventDefault ) event.preventDefault();
						else event.returnValue = false;

						if ( !inTransition.tempSaveText ) pages.current.savePage(this);
					}
				}, [
					h("i.icon.icon-diskette", ["Save"])
				]),
				h("a.ph-edit-btn.ph-cheatsheet", {
					href: "#",
					onclick: function ( event ) {
						event = event || window.event;
						if ( event.preventDefault ) event.preventDefault();
						else event.returnValue = false;

						DOM.set({
							state: {
								cheatSheet: !DOM.state.cheatSheet
							}
						});
						return false;
					}
				}, [
					h("i.icon.icon-pen", ["Markdown help"])
				])
			]),
			h("div#cheatSheet",
				( !DOM.state.cheatSheet ? ({ style:{display: "none"} }) : null ), [
				"This will be a cheat-sheet for markdown.  For now, go to one of these two sites for help:",
				h("p", [
					h("a", {
						target: "_blank",
						href: "http://jbt.github.io/markdown-editor"
					}, ["http://jbt.github.io/markdown-editor"])
				]),
				h("p", [
					h("a", {
						target: "_blank",
						href: "http://stackedit.io"
					}, ["http://stackedit.io"])
				])
			]),
			h("#ph-contentWrap", [
				h("#ph-input", [
					h("textarea#ph-textarea", [String(pages.current.text || "")])
				]),
				h("#ph-output")
			])
		])
	);
}

function renderDefault ( tabsDOM ) {
	return (
		h("#ph-content.fullPage", [
			h("h1#ph-title", [String(pages.current.title || "")]),
			tabsDOM,
			h("#ph-contentWrap", [
				h("#ph-output")
			])
		])
	);
}

function renderPage ( navDOM, tabsDOM, DOM ) {
	return (
		h("#ph-wrapper", [
			h("#ph-search-wrap", [
				h("label", [
					h("input#ph-search", {
						type: "text",
						name: "ph-search",
						placeholder: pages.options.searchPlaceholder
					})
				])
			]),
			h("#ph-side-nav", [navDOM]),
			(
				( misc.codeMirror ) ?
					(
						DOM.state.addingContent ? renderAddContent() : renderEditor(tabsDOM, DOM)
					) :
					renderDefault(tabsDOM)
			)
		])
	);
}

module.exports = renderPage;
