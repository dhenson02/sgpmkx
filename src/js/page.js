var h = require("virtual-dom/h"),
	pages = require("./store").pages,
	events = require("./store").events;

function render ( navDOM, tabsDOM ) {
	return (
		h("#ph-wrapper", [
			h("#ph-search-wrap", [
				h("label", { htmlFor: "ph-search" }, ["Search (for now use up and down keys to select, then press enter):\n"]),
				h("input#ph-search", { placeHolder: "Search...!" })
			]),
			h("#ph-side-nav", [navDOM]),
			h("#ph-content.fullPage", [
				tabsDOM,
				h("h1#ph-title", [String(title || "")]),
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
					//"Search:\n",
					h("input#ph-search", {
						type: "text",
						name: "ph-search",
						placeholder: "Search...!"
					})
				])
			]),
			h("#ph-side-nav", [navDOM]),
			h("a.ph-toggle-editor", {
				href: "#",
				role: "button",
				/*type: "checkbox",
				name: "ph-toggle",
				checked: pages.fullPage,*/
				onclick: function ( event ) {
					event = event || window.event;
					if ( event.preventDefault ) event.preventDefault();
					else event.returnValue = false;

					pages.fullPage = !pages.fullPage;
					DOM.content.className = ( pages.fullPage ) ? "fullPage" : "";
					this.innerHTML = pages.fullPage ? "Show editor" : "Hide editor";
					DOM.editor.refresh();
				}
				/*style: { display: "none" }*/
			}, [pages.fullPage ? "Show editor" : "Hide editor"]),
			h("#ph-content.fullPage", [
				h("h1#ph-title", [String(pages.current.title || "")]),
				tabsDOM,
				h("#ph-buttons", [
					//h("div.clearfix"),
					h("a.ph-edit-btn.ph-save", {
						href: "#",
						title: "Save",
						onclick: function ( event ) {
							event = event || window.event;
							if ( event.preventDefault ) event.preventDefault();
							else event.returnValue = false;

							pages.current.save(this);
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
