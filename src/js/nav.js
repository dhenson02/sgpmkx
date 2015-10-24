var h = require("virtual-dom").h,
	pages = require("./pages"),
	events = require("./events");

function handleClick ( e ) {
	e = e || window.event;
	if ( e.stopPropagation ) e.stopPropagation();
	else if ( e.cancelBubble ) e.cancelBubble();
}

function renderLink ( link, DOM ) {
	var opened = ( !link.children ? DOM.state.opened[link.parent] : DOM.state.opened[link.path] ),
		attr = ( link.level > 2 && !opened ? { display: "none" } : {} );
	return (
		h("li.link#ph-link-" + link.id + link.className,
			{ style: attr },
			[
				h("a.ph-level-" + link.level + ( link.path !== DOM.state.path ? "" : ".active" ), {
					href: link.href,
					target: ( link.href.charAt(0) !== "#" ? "_blank" : "" ),
					onclick: handleClick
				}, [
					( !link.icon ? null : h("i.icon.icon-" + link.icon) ),
					h("span.link-title", [
						String(link.title)
					]),
					( !link.children ?
						null :
						h("i.icon.icon-angle-" + ( !opened ? 'down' : 'up' ) + ".toggle-menu", {
							onclick: function ( e ) {
								e = e || window.event;
								if ( e.stopPropagation ) e.stopPropagation();
								else if ( e.cancelBubble ) e.cancelBubble();
								if ( e.preventDefault ) e.preventDefault();
								else e.returnValue = false;

								var openState = Object.create(DOM.state.opened);
								openState[link.path] = !opened;
								DOM.setState({
									opened: openState
								}, false, true);
							}
						}) ),
					h("span.place")
				])
			])
	);
}

function renderSection ( section, DOM ) {
	var links = section.links.map(function ( link ) {
		return renderLink(link, DOM);
	});
	return (
		h("li#ph-link-" + section.id + ".ph-section.link", [
			h("a.ph-level-1" + ( section.path !== DOM.state.path ? "" : ".active" ), {
				"href": "#" + section.path,
				onclick: handleClick
			}, [
				h("span.link-title", [ section.title ])
			]),
			h("ul", links)
		])
	);
}

function renderNav ( DOM ) {
	var links = [],
		name;

	for ( name in pages.sections ) {
		if ( pages.sections.hasOwnProperty(name) ) {
			links.push(renderSection(pages.sections[name], DOM));
		}
	}
	return (
		h("#ph-nav", [
			h(".header", [
				h("a" + ( DOM.state.path !== "/" ? "" : ".active" ), {
					"href": "#/",
					onclick: handleClick
				}, [
					h(".logo", [
						h("img", {
							"src": pages.options.images + "/phLogo64.png",
							"alt": "Public Health Home",
							"height": "64",
							"width": "64"
						})
					]),
					h("p.text", [
						"Public Health",
						h("br"),
						h("small", ["US Air Force"])
					])
				])
			]),
			/*h("#ph-site-pages", [
				h("div", [
					h("a.site-page", {
						href: "#/leaders"
					}, [
						"Leaders"
					]),
					h("a.site-page", {
						href: "#/news"
					}, [
						"News"
					]),
					h("a.site-page", {
						href: "#/contact"
					}, [
						"Address Book"
					])
				])
			]),*/
			h("ul.nav", links)
		])
	);
}

module.exports = renderNav;
