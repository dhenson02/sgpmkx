var h = require("virtual-dom").h,
	pages = require("./pages"),
	events = require("./events");

function renderTabs ( DOM ) {
	var style = ( DOM.state.level > 1 ) ? {} : { display: "none" },
		group = phTabs.map(function ( tab ) {
			var tabName = tab.title.replace(/\s/g, ""); // Kinda future-proofing
			var className = ".ph-tab-" + tabName.toLowerCase() + (
					( pages.options.hideEmptyTabs && pages.current[tabName].length < 1 && tabName !== "Contributions" ) ? ".tab-empty" : "" ) + (
					( DOM.state.tab !== tabName ) ? "" : ".tab-current"
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
						}, [ h("span", [tab.title]) ])
					]),
					( DOM.state.fullPage && tabName === "Contributions" && pages.options.contribPOCEmail ) ?
						h("a.ph-contrib-poc", {
							href: "mailto:" + pages.options.contribPOCEmail,
							title: "POC: " + pages.options.contribPOCName
						}, ["Submit your own!"]) :
						null
				])
			);
		});
	return (
		h("nav", [
			h("ul", /*{ style: style },*/ group)
		])
	);
}

module.exports = renderTabs;
