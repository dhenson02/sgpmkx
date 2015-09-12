var h = require("virtual-dom/h");

function renderTab ( title, handleClick ) {
	return (
		h("li", [
			h("a.icon.icon-" + title.toLowerCase(), {
				href: "#",
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;
					handleClick(title);
					if ( / ?tab-current/gi.test(this.parentNode.className) === false ) {
						var tabCurrent = document.querySelector(".tab-current");
						if ( tabCurrent ) {
							tabCurrent.className = tabCurrent.className.replace(/ ?tab\-current/gi, "");
						}
						this.parentNode.className += " tab-current";
					}
					return false;
				}
			}, [h("span", [String(title)])])
		])
	);
}

function render ( tabs, style, launch ) {

	var group = [];
	var i = 0;
	var count = tabs.length;
	for ( ; i < count; ++i ) {
		group.push(renderTab(tabs[i], launch));
	}
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

module.exports = render;
