var h = require("virtual-dom/dist/virtual-dom").h,
	pages = require("./pages"),
	events = require("./events"),
	hashArray, level, a, subMenu, path;

function linkRender ( self ) {
	self.props.icon = ( !self.props.icon ) ? null : h("i.icon.icon-" + self.props.icon);
	self.props.target = ( self.props.href.charAt(0) !== "#" ) ? "_blank" : "";
	return (
		h("li.link#ph-link-" + self.props.id + self.props.className, self.props.attr, [
			h("a.ph-level-" + self.props.level + self.props.active, {
				href: self.props.href,
				target: self.props.target
			}, [
				self.props.icon,
				h("span.link-title", [String(self.props.title)]),
				h("span.place")
			])
		])
	);
}

function Link ( props ) {
	//props.attr = ( props.level > 2 && ( props.href.indexOf(a) < 0 || level < 2 ) ) ? { style: { display: "none" } } : null;
	//props.active = ( props.href === window.location.hash ) ? ".active" : "";
	this.props = props;
	this.linkRender = linkRender;
}
Link.prototype.type = "Thunk";
Link.prototype.render = function ( prev ) {
	this.props.attr = ( this.props.parent === subMenu && this.props.level > 2 ) ? { style: { display: "none" } } : null;
	this.props.active = ( this.props.path === path ) ? ".active" : "";
	if ( this.props.id == 4 || this.props.id == 21 ) {
		console.log("========" + this.props.title + "========");
		console.log("link attr: ", this.props.attr);
		console.log("prev attr: ", prev&&prev.props.attr);
		console.log("current submenu: ", subMenu);
		console.log("link active: ", this.props.active);
		console.log("prev active: ", prev&&prev.props.active);
		console.log("current path: ", path);
	}
	var prevProps = prev ? prev.props : null;
	if ( (!prevProps || !this.props) || (this.props.active !== prevProps.active) || (this.props.attr != prevProps.attr) ) {
		if ( this.props.id == 21 || this.props.id == 4 ) {
			console.log("new render for: " + this.props.title);
		}
		return this.linkRender(this);
	}
	else {
		return prev.vnode;
	}
};

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
		return new Link(link);
		//return renderLink(link);
	});
	return (
		h("li#ph-link-" + section.id + ".ph-section.link", [
			h("a.ph-level-1" + ( "#" + section.path === window.location.hash ? ".active" : "" ), {
				"href": "#" + section.path
			}, [
				h("span.link-title", [String(section.title)])
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
			links.push(renderSection(pages.sections[name]));
		}
	}
	/*level = DOM.state.level;
	hashArray = DOM.state.hashArray;
	a = DOM.state.truncPath;*/
	path = DOM.state.path;
	subMenu = DOM.state.subMenu;
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
