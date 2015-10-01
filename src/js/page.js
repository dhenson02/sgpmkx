var h = require("virtual-dom/h"),
	pages = require("./store").pages,
	events = require("./store").events,
	current = pages.current,
	DOM = require("./domStore"),
	Nav = require("./nav"),
	Tabs = require("./tabs");

function render ( cfg ) {
	return (
		h("#ph-wrapper", [
			h("#ph-search-wrap", [
				h("label", {
					htmlFor: "ph-search"
				}, [
					"Search (for now use up and down keys to select, then press enter):\n",
					h("input#ph-search", {
						"placeholder": "Search...!"
					})
				])
			]),
			h("#ph-side-nav", [new Nav(cfg.nav)]),
			h("#ph-content.fullPage", [
				new Tabs(),
				h("h1#ph-title", [String(current.title || "")]),
				h("#ph-contentWrap", [
					h("#ph-output")
				])
			])
		])
	);
}

function editor ( cfg ) {
	return (
		h("#ph-wrapper", [
			h("#ph-search-wrap", [
				h("label", { htmlFor: "ph-search" }, [
					"Search (for now use up and down keys to select, then press enter):\n",
					h("input#ph-search", {
						"placeholder": "Search...!"
					})
				])
			]),
			h("#ph-side-nav", [new Nav(cfg.nav)]),
			h("#ph-content.fullPage", [
				h("#ph-buttons", [
					h("label.ph-toggle-label", { htmlFor: "ph-toggle" }, [
						h("input#ph-toggle.ph-toggle-editor", {
							type: "checkbox",
							name: "toggle",
							checked: ( pages.viewMode ) ? "checked" : "",
							onchange: function () {
								pages.viewMode = ( !pages.viewMode ) ? "fullPage" : "";
								DOM.content.className = pages.viewMode;
								DOM.editor.refresh();
							},
							style: { display: "none" }
						}, ["Edit page"])
					]),
					h("div.clearfix"),
					h("a#cheatSheetButton.ph-btn", {
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
						}
					}, ["Markdown help"]),
					h("a#saveButton.ph-btn", {
						href: "#",
						onclick: function ( event ) {
							event = event || window.event;
							if ( event.preventDefault ) event.preventDefault();
							else event.returnValue = false;
							current.save(this);
						}
					}, ["Save"])
				]),
				new Tabs(),
				h("h1#ph-title", [String(current.title)]),
				h("#cheatSheet", {
					style: {
						display: "none"
					}
				}, [
					"This will be a cheat-sheet for markdown"
				]),
				h("#ph-contentWrap", [
					h("#ph-input", [
						h("textarea#ph-textarea", [String(current.text)])
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
