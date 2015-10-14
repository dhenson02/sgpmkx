var h = require("virtual-dom/h"),
	pages = require("./pages"),
	events = require("./events"),
	misc = require("./helpers"),
	inTransition = misc.inTransition;

function render ( navDOM, tabsDOM ) {
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
			h("#ph-content.fullPage", [
				h("h1#ph-title", [String(pages.current.title || "")]),
				tabsDOM,
				h("#ph-contentWrap", [
					h("#ph-output")
				])
			])
		])
	);
}

function editor ( navDOM, tabsDOM, DOM ) {
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
			h("div#ph-content" + (( DOM.fullPage ) ? ".fullPage" : ""), [
				h("a.ph-toggle-editor", {
					href: "#",
					role: "button",
					onclick: function ( event ) {
						event = event || window.event;
						if ( event.preventDefault ) event.preventDefault();
						else event.returnValue = false;

						DOM.fullPage = !DOM.fullPage;
						//pages.current[pages.current.type.replace(/\s/g, "").toLowerCase()] = pages.current.text;
						//DOM.content.className = ( DOM.fullPage ) ? "fullPage" : "";
						//this.innerHTML = DOM.fullPage ? "Show editor" : "Hide editor";

						DOM.loadContent();

						/*if ( !DOM.fullPage ) {
							DOM.editor.refresh();
						}*/
					}
					/*style: { display: "none" }*/
				}, [DOM.fullPage ? "Show editor" : "Hide editor"]),
				h("h1#ph-title", [String(pages.current.title || "")]),
				tabsDOM,
				h("#ph-buttons", [
					h("a.ph-edit-btn.ph-save", {
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

							if ( DOM.cheatSheet.style.display === "none" ) {
								DOM.cheatSheet.removeAttribute("style");
							}
							else {
								DOM.cheatSheet.style.display = "none";
							}
							return false;
						}
					}, [
						h("i.icon.icon-pen", ["Markdown help"])
					])
				]),
				h("#cheatSheet", {
					style: {
						display: "none"
					}
				}, [
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
		])
	);
}

module.exports = {
	render: render,
	editor: editor
};
