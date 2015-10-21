var h = require("virtual-dom/dist/virtual-dom").h,
	pages = require("./pages"),
	events = require("./events"),
	hashArray, level, a;

function renderLink ( link ) {
	var c = link.href.indexOf(a),
		attr = { style: {} };

	if ( link.level > 2 && ( c < 0 || level < 2 ) ) {
		attr.style = { display: "none" };
	}
	return (
		h("li#ph-link-" + link.id + link.className,
			attr, [
			h("a.ph-level-" + link.level + ( link.href === window.location.hash ? ".active" : "" ), {
				href: link.href,
				target: ( link.href.charAt(0) !== "#" ? "_blank" : "" )
			}, [
				( !link.icon ) ? null : h("i.icon.icon-" + link.icon),
				h("span.link-title", [String(link.title)]),
				h("span.place")
			])
		])
	);
}

function renderSection ( section ) {
	var links = section.links.map(function( link ) {
		return renderLink(link);
	});
	return (
		h("li#ph-link-" + section.id + ".ph-section.link", [
			//h("p", [
				h("a.ph-level-1" + ( "#" + section.path === window.location.hash ? ".active" : "" ), {
					"href": "#" + section.path
				}, [
					h("span.link-title", [String(section.title)])
				]),
			//]),
			h("ul", links)
		])
	);
}

function renderNav () {
	var links = [],
		name;

	hashArray = window.location.hash.slice(1).split(/\//g);
	level = hashArray.length - 1;
	a = hashArray.slice(0, 3).join("/");

	for ( name in pages.sections ) {
		if ( pages.sections.hasOwnProperty(name) ) {
			links.push(renderSection(pages.sections[name]));
		}
	}
	return (
		h("#ph-nav", [
			h(".ph-header", [
				h("a" + ( window.location.hash === "#/" ? ".active" : "" ), {
					"href": "#/"
				}, [
					h(".ph-header-logo", [
						h("img", {
							"src": pages.options.images + "/phLogo64.png",
							"alt": "Public Health Home",
							"height": "64",
							"width": "64"
						})
					]),
					h("p.ph-header-text", [
						"Public Health",
						h("br"),
						h("small", ["US Air Force"])
					])
				])
			]),
			h(".ph-site-pages", [
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
