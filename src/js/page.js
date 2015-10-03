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
					"Search:\n",
					h("input#ph-search", {
						type: "text",
						name: "ph-search",
						placeholder: "Search...!"
					})
				])
			]),
			h("#ph-side-nav", [navDOM]), h("label.ph-toggle-label", [
				"Hide editor ",
				h("input.ph-toggle-editor", {
					type: "checkbox",
					name: "ph-toggle",
					//checked: ( pages.fullPage ) ? "" : "checked",
					checked: pages.fullPage,
					onchange: function () {
						pages.fullPage = this.checked;
						DOM.content.className = ( pages.fullPage ) ? "fullPage" : "";
						DOM.editor.refresh();
						return false;
					}
					/*style: { display: "none" }*/
				})
			]),
			h("#ph-content.fullPage", [
				h("#ph-buttons", [
					//h("div.clearfix"),
					h("a.ph-cheatsheet", {
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
						"Markdown help"
						//h("i.icon.icon-pen", ["Markdown help"])
					]),
					h("a.ph-save", {
						href: "#",
						title: "Save",
						onclick: function ( event ) {
							event = event || window.event;
							if ( event.preventDefault ) event.preventDefault();
							else event.returnValue = false;

							pages.current.save(this);
						}
					}, [
						h("i.icon.icon-diskette"/*, ["Save"]*/)
					])
				]),
				tabsDOM,
				h("h1#ph-title", [String(pages.current.title || "")]),
				h("#cheatSheet", {
					style: {
						display: "none"
					}
				}, [
					"This will be a cheat-sheet for markdown"
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
