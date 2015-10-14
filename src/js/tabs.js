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
			var tabName = tab.title.replace(/\s/g, "").toLowerCase();
			var className = ".tab-" + tabName + (
					( pages.options.hideEmptyTabs === true && pages.current[tabName].length < 1 ) ? ".tab-empty" : ""
				) + (
					( pages.current.type.replace(/\s/g, "").toLowerCase() === tabName ) ? ".tab-current" : ""
				);

			return (
				h("li" + className, [
					h("a.icon.icon-" + tab.icon, {
						href: "#",
						onclick: function ( e ) {
							e = e || window.event;
							if ( e.preventDefault ) e.preventDefault();
							else e.returnValue = false;
							events.emit("tab.change", tab.title);
							return false;
						}
					}, [
						h("span", [
							String(tab.title)
						])
					])
				])
			);
		});
	/**
	 * Use this instead of traditional for-loop if trying to hide empty tabs.
	 */
	/*var name;
	 for ( name in tabs ) {
	 if ( tabs.hasOwnProperty(name) /!*&& tabs[name] > 1*!/ ) {
	 group.push(renderTab(name, launch));
	 }
	 }*/
	return (
		h("#ph-tabs.ph-tabs.ph-tabs-style-iconbox", [
			h("nav", [
				h("ul", style, group)
			])
		])
	);
}

module.exports = renderTabs;
