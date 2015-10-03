var h = require("virtual-dom/h"),
	store = require("./store"),
	pages = store.pages,
	events = store.events,
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
			return (
				h("li", [
					h("a.icon.icon-" + tab.icon, {
						href: "#",
						onclick: function ( e ) {
							e = e || window.event;
							if ( e.preventDefault ) e.preventDefault();
							else e.returnValue = false;
							events.emit("tab.change", tab.title);

							if ( / ?tab\-current/gi.test(this.parentNode.className) === false ) {
								var tabCurrent = document.querySelector(".tab-current");
								if ( tabCurrent ) {
									tabCurrent.className = tabCurrent.className.replace(/ ?tab\-current/gi, "");
								}
								this.parentNode.className += " tab-current";
							}
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
