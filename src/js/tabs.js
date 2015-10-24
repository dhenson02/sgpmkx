var h = require("virtual-dom").h,
	pages = require("./pages"),
	events = require("./events");

function renderTabs ( DOM ) {
	var group = phTabs.map(function ( tab ) {

		var tabName = tab.title.replace(/\s/g, ""); // Kinda future-proofing
		var className = ".ph-tab-" + tabName.toLowerCase() + (
				( pages.current[ tabName ].length < 1 && pages.options.hideEmptyTabs ) ? ".ph-tab-empty" : "" ) + (
				( DOM.state.tab !== tabName ) ? "" : ".ph-tab-current"
			);
		return (
			h("li" + className, [
				h(".ph-tab-box", [
					h("a.icon.icon-" + tab.icon, {
						href: "#",
						onclick: function ( e ) {
							e = e || window.event;
							if ( e.stopPropagation ) e.stopPropagation();
							else if ( e.cancelBubble ) e.cancelBubble();
							if ( e.preventDefault ) e.preventDefault();
							else e.returnValue = false;

							events.emit("tab.change", tab.title);
							return false;
						}
					}, [ h("span", [ tab.title ]) ])
				]),
				( DOM.state.fullPage && tabName === "Contributions" && pages.options.contribPOCEmail ) ?
					h("a.ph-contrib-poc", {
						href: "mailto:" + pages.options.contribPOCEmail,
						title: "POC: " + pages.options.contribPOCName
					}, [ "Submit your own!" ]) :
					null
			])
		);
	});
	return (
		h("nav", [
			h("ul", group)
		])
	);
}

module.exports = renderTabs;
