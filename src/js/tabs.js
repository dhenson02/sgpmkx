var h = require("virtual-dom/h");

function renderTab ( title, icon, handleClick, initialTab ) {
	return (
		h("li" + initialTab, [
			h("a.icon.icon-" + icon, {
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

function renderTabs ( tabs, style, launch ) {

	var group = [];
	var i = 0;
	var count = tabs.length;
	var initial = ".tab-current";
	for ( ; i < count; ++i ) {
		group.push(renderTab(tabs[i].title, tabs[i].icon, launch, initial));
		initial = "";
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
	return ( ( count === 1 ) ? null : (
			h("#ph-tabs.ph-tabs.ph-tabs-style-iconbox", [
				h("nav", [
					h("ul", style, group)
				])
			])
		)
	);
}

module.exports = renderTabs;
