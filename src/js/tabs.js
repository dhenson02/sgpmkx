var h = require("virtual-dom").h,
	pages = require("./pages"),
	events = require("./events"),
	tabs = [
		{
			title: "Overview",
			icon: "home"
		},
		{
			title: "Policy",
			icon: "notebook"
		},
		{
			title: "Training",
			icon: "display1"
		},
		{
			title: "Resources",
			icon: "cloud-upload"
		},
		{
			title: "Tools",
			icon: "tools"
		},
		{
			title: "Contributions",
			icon: "users"
		}
	];

function renderTabs ( DOM ) {
	var style = ( DOM.state.level > 1 ) ? null : { style: { display: "none" } },
		group = tabs.map(function ( tab ) {
			var tabName = tab.title.replace(/\s/g, "");
			var className = ".ph-tab-" + tabName.toLowerCase() + (
					( pages.options.hideEmptyTabs && pages.current[tabName].length < 1 && tabName !== "Contributions" ) ? ".tab-empty" : "" ) + (
					( pages.current.type === tabName ) ? ".tab-current" : "" );

			return (
				h("li" + className, [
					h("div.ph-tab-box", [
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
						}, [h("span", [String(tab.title)])])
					]),
					( pages.options.contribPOCEmail && tabName === "Contributions" ) ?
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
			h("ul", style, group)
		])
	);
}

module.exports = renderTabs;
