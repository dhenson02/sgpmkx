var h = require("virtual-dom/h"),
	pages = require("./pages"),
	events = require("./events"),
	map = require("lodash/collection/map"),
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

function renderTabs () {
	var style = ( pages.current.program !== "" ) ? null : { style: { display: "none" } },
		group = map(tabs, function ( tab ) {
			var tabName = tab.title.replace(/\s/g, "").toLowerCase().trim();
			var className = ".ph-tab-" + tabName + (
					( pages.options.hideEmptyTabs === true && pages.current[tabName].length < 1 && tabName !== "contributions" ) ? ".tab-empty" : ""
				) + (
					( pages.current._type === tabName ) ? ".tab-current" : ""
				);

			return (
				h("li" + className, [
					h("div.ph-tab-box", [
						h("a.icon.icon-" + tab.icon, {
							href: "#",
							onclick: function ( e ) {
								e = e || window.event;
								if ( e.preventDefault ) e.preventDefault();
								else e.returnValue = false;

								events.emit("tab.change", tab.title);
								return false;
							}
						}, [ h("span", [ String(tab.title) ]) ])
					]),
					( pages.options.contribPOCEmail && tabName === "contributions" ) ?
						h("a.ph-contrib-poc", {
							href: "mailto:" + pages.options.contribPOCEmail,
							title: "POC: " + pages.options.contribPOCName
						}, [String("POC: " + pages.options.contribPOCName)]) :
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
