var h = require("virtual-dom/h"),
	map = require("lodash/collection/map"),
	events = require("./store").events,
	pages = require("./store").pages;

function Tabs ( cfg ) {
	this.type = "Widget";
	this.tabs = cfg || [
		{ title: "Overview", icon: "home" },
		{ title: "Policy", icon: "notebook" },
		{ title: "Training", icon: "display1" },
		{ title: "Resources", icon: "cloud-upload" },
		{ title: "Tools", icon: "tools" },
		{ title: "Contributions", icon: "users" }
	];
	this.style = ( pages.current.program !== "" ) ? null : { style: { display: "none" } };
}

Tabs.prototype.init = function () {
	var tabs = map(this.tabs, function ( tab ) {
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
	return createElement(
		( this.tabs && this.tabs.length === 1 ) ?
			null :
			h("#ph-tabs.ph-tabs.ph-tabs-style-iconbox", [
				h("nav", [
					h("ul",
						this.style,
						tabs
					)
				])
			])

	);
};

Tabs.prototype.update = function ( prev, dom ) {
	this.style = ( pages.current.program !== "" ) ? null : { style: { display: "none" } };
	return ( this.style != prev.style ) ? this.init() : createElement(null); //h(null)
};

module.exports = Tabs;
