var h = require("virtual-dom/h"),
	Events = require("eventemitter2").EventEmitter2,
	events = new Events({ wildcard: true });

function Content () {
	if ( !(this instanceof Content) ) {
		return new Content();
	}
	this.id = -1;
	this.title = "";
	this.icon = "";
	this.text = "";
	this.overview = "";
	this.policy = "";
	this.training = "";
	this.resources = "";
	this.tools = "";
	this.contributions = "";
	this.section = "";
	this.program = "";
	this.page = "";
	this.rabbitHole = "";
	this.type = "Overview";
	this.listItemType = "";
	this.timestamp = null;
}

Content.prototype.set = function ( data ) {
	var name;
	for ( name in data ) {
		if ( this.hasOwnProperty(name) ) {
			this[name] = data[name];
		}
	}
	return this;
};

function Pages () {
	if ( !(this instanceof Pages) ) {
		return new Pages();
	}
	this.current = new Content();
}

Pages.prototype.init = function ( data ) {
	var urls = [],
		i = 0,
		count = data.d.results.length,
		result,
		parents = {},
		subParents = {};
	this.sections = {};
	for ( ; i < count; ++i ) {
		result = data.d.results[i];

		/**
		 * These come down as null if they're empty so let's standardize
		 * em all as empty strings instead.  Then we can concat to other
		 * stuff later without doing more checks.
		 */
		result.Section = ( result.Section ) ? result.Section.replace(/\s/g, "") : "";
		result.Program = ( result.Program ) ? result.Program.replace(/\s/g, "") : "";
		result.Page = ( result.Page ) ? result.Page.replace(/\s/g, "") : "";
		result.rabbitHole = ( result.rabbitHole ) ? result.rabbitHole.replace(/\s/g, "") : "";

		/**
		 * This creates a new property `Path` and cascades down the
		 * logical chain of categories.
		 *
		 *     PS - `rabbitHole` can be seen on the List as `SubPage` ;)
		 *
		 * @type {string}
		 */
		result.Path = "/" + (( result.Section !== "" ) ?
			result.Section + (( result.Program !== "" ) ?
			"/" + result.Program + (( result.Page !== "" ) ?
			"/" + result.Page + (( result.rabbitHole !== "" ) ?
			"/" + result.rabbitHole :
				"" ) :
				"" ) :
				"" ) :
				"");

		// This allows direct access without having to manipulate
		// anything (aside from whitespace removal) or search/test for a match.
		this[result.Path] = result;
		urls[i] = result.Path;

		if ( result.Section !== "" && result.Program === "" ) {
			this.sections[result.Section] = {
				path: ( !result.Link ) ? "#/" + result.Section : result.Link,
				title: result.Title,
				id: result.ID,
				links: []
			};
		}

		if ( result.rabbitHole !== "" ) {
			subParents["/" + result.Section + "/" + result.Program + "/" + result.Page] = ".ph-sub-parent.ph-page.link";
		}
		else if ( result.Page !== "" ) {
			parents["/" + result.Section + "/" + result.Program] = ".ph-parent.ph-program.link";
		}

	}

	urls.sort();
	i = 0;
	for ( ; i < count; ++i ) {
		var page = this[urls[i]];
		var isPage = false;
		var level;
		var name = page.rabbitHole || page.Page || page.Program;

		if ( page.rabbitHole !== "" ) {
			isPage = true;
			level = ".ph-rabbit-hole.link";
		}
		else if ( page.Page !== "" ) {
			isPage = true;
			level = subParents[page.Path] || ".ph-page.link";
		}
		else if ( page.Program !== "" ) {
			level = parents[page.Path] || ".ph-program.link";
		}

		if ( page.Link ) {
			//attr["data-href"] = "#" + page.Path;
		}

		if ( page.Program !== "" ) {
			this.sections[page.Section].links.push({
				path: page.Path,
				href: ( !page.Link ) ? "#" + page.Path : page.Link,
				title: page.Title,
				level: level,
				name: name,
				id: page.ID,
				icon: page.Icon || "",
				attr: isPage ? { style: { display: "none" } } : {},
				hr: isPage ? null : h("hr")
			});
		}
	}
};

Pages.prototype.set = function ( data ) {
	var name;
	for ( name in data ) {
		if ( this.hasOwnProperty(name) ) {
			this[name] = data[name];
		}
	}
	return this;
};

var pages = new Pages();

module.exports = {
	events: events,
	pages: pages
};

/**
 * For Tools:
 *  Calculators
 *  Checklists
 *  Forms
 *  Templates
 *  Trackers
 */
