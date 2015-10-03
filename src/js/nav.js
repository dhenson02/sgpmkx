var h = require("virtual-dom/h"),
	codeMirror = require("./helpers").codeMirror,
	map = require("lodash/collection/map"),
	store = require("./store"),
	pages = store.pages,
	events = store.events;

function renderLink ( link ) {
	return (
		h("li#ph-link-" + link.id + link.level, link.attr, [
			h("a", {
				href: link.href,
				target: ( link.href.charAt(0) !== "#" ) ? "_blank" : ""
			}, [
				( !link.icon ) ? null : h("i.icon.icon-" + link.icon),
				String(link.title),
				h("span.place")
			]),
			link.hr
		])
	);
}

function renderSection ( section ) {
	var links = [],
		i = 0,
		count = section.links.length;
	for ( ; i < count; ++i ) {
		links[i] = renderLink(section.links[i]);
	}
	if ( codeMirror ) {
		links[++i] = (
			h("a.ph-btn.ph-create", {
				href: "#",
				onclick: function ( event ) {
					event = event || window.event;
					if ( event.preventDefault ) event.preventDefault();
					else event.returnValue = false;
					pages.create(section.path);
				}
			}, ["New"])
		);
	}
	return (
		h("li.ph-section.link", [
			h("p", [
				h("a", { "href": section.path }, [String(section.title)])
			]),
			h("hr"),
			h("ul", links)
		])
	);
}

function renderNav () {
	var links = [],
		name;

	for ( name in pages.sections ) {
		if ( pages.sections.hasOwnProperty(name) ) {
			links.push(renderSection(pages.sections[name]));
		}
	}
	links.push(
		h("a.ph-btn.ph-create", {
			href: "#",
			onclick: function ( event ) {
				event = event || window.event;
				if ( event.preventDefault ) event.preventDefault();
				else event.returnValue = false;
				pages.create("/");
			}
		}, ["New"])
	);
	return (
		h("#ph-nav", [
			h(".header", [
				h("a", {
					"href": "#/"
				}, [
					h(".logo", [
						h("img", {
							"src": "/kj/kx7/PublicHealth/SiteAssets/Images/phLogo64-gs.png",
							//"src": "img/phLogo64-gs.png",
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
			h("#ph-site-pages", [
				h("div", [
					h("a.site-page", { href: "#/leaders" }, ["Leaders"]),
					h("a.site-page", { href: "#/news" }, ["News"]),
					h("a.site-page", { href: "#/contact" }, ["Address Book"])
				])
			]),
			h("ul.nav", links)
		])
	);
}

module.exports = renderNav;
