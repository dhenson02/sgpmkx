var h = require("virtual-dom/h");
var sweetAlert = require("sweetalert");

function renderLink ( link ) {
	return (
		h(link.li, link.attr, [
			h("a", {
				href: link.path,
				onclick: function( event ) {
					if ( link.path.charAt(0) !== "#" ) {
						event = event || window.event;
						if ( event.preventDefault ) event.preventDefault();
						else event.returnValue = false;
						sweetAlert({
							title: "See ya!",
							text: "You are now leaving the Public Health Kx.  Bye!",
							type: "warning",
							cancelButtonText: "Nah I'll stay",
							confirmButtonText: "Go!",
							//confirmButtonColor: "#ec6c62",
							closeOnConfirm: false,
							showCancelButton: true,
							showLoaderOnConfirm: true
						}, function () {
							window.location.href = link.path;
							return false;
						});
						return false;
					}
				}
			}, [
				String(link.title),
				h("span")
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
	return (
		h("li", [
			h("p.ph-section-link", [
				h("a", { "href": section.path }, [String(section.title)])
			]),
			h("hr"),
			h("ul", links)
		])
	);
}

function renderNav ( sections ) {
	var links = [],
		name;

	//console.log("sections (in nav.js):", sections);

	for ( name in sections ) {
		if ( sections.hasOwnProperty(name) ) {
			links.push(renderSection(sections[name]));
		}
	}
	return (
		h("#ph-nav", [
			h(".header", [
				h("a", {
					"href": "#/"
				}, [
					h(".logo", [
						h("img", {
							"src": "/kj/kx7/PublicHealth/SiteAssets/Images/phLogo64-gs.png",
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
			h("ul.nav", links)
		])
	);
}

module.exports = renderNav;
