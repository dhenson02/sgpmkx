var h = require("virtual-dom/h"),
	codeMirror = require("./helpers").codeMirror,
	map = require("lodash/collection/map"),
	pages = require("./pages"),
	events = require("./events");

function renderLink ( link ) {
	return (
		h("li#ph-link-" + link.id + link.className, link.attr, [
			h("a.ph-level-" + link.level, {
				href: link.href,
				target: ( link.href.charAt(0) !== "#" ) ? "_blank" : ""
			}, [
				( !link.icon ) ? null : h("i.icon.icon-" + link.icon),
				h("span.link-title", [String(link.title)]),
				h("span.place")
			])
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
	return (
		h("li.ph-section.link", [
			h("p", [
				h("a", {
					"href": section.path
				}, [
					h("span.link-title", [String(section.title)])
				])
			]),
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
	if ( codeMirror ) {
		links.unshift(
			h("a.ph-btn.ph-create.loading", {
				href: "#/new",
				title: "New section",
				onclick: function ( event ) {
					event = event || window.event;
					if ( event.preventDefault ) event.preventDefault();
					else event.returnValue = false;

					/**
					 * TODO:
					 *  This needs to perform a .setRoute() so it changes the URL
					 *  and thus becomes the "active" page without fiddling around
					 *  here all ghetto-like.
					 */
					// Until I work on this again, just disable it.

					// When ready to use, remove the ".loading" on this element

					// events.emit("content.start");
					return false;

				}
			}, [
				h("span.btn-title", ["Add content"])
			])
		);
	}
	return (
		h("#ph-nav", [
			h(".header", [
				h("a", {
					"href": "#/"
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
			h("#ph-site-pages", [
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
			]),
			h("ul.nav", links)
		])
	);
}

module.exports = renderNav;
