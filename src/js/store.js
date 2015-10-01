var h = require("virtual-dom/h"),
	Events = require("eventemitter2").EventEmitter2,
	events = new Events({ wildcard: true }),
	pluck = require("lodash/collection/pluck"),
	misc = require("./helpers");

function Content () {
	if ( !(this instanceof Content) ) {
		return new Content();
	}
	this.id = -1;
	this.title = "";
	this.keywords = [];
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

Content.prototype.save = function ( self ) {
	this.set({
		text: this.text.trim()
	});
	this[this.type.toLowerCase()] = this.text;
	var data = {
		'__metadata': {
			'type': this.listItemType
		},
		'Title': this.title,
		'Keywords': this.keywords,
		'Overview': this.overview,
		'Policy': this.policy,
		'Training': this.training,
		'Resources': this.resources,
		'Tools': this.tools,
		'Contributions': this.contributions
	};
	events.emit("content.save", data, this.id, self);
};

function Pages () {
	if ( !(this instanceof Pages) ) {
		return new Pages();
	}
	this.current = new Content();
	this.viewMode = "fullPage";
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
	this.titles = [];
	for ( ; i < count; ++i ) {
		var page = this[urls[i]],
			isPage = false,
			level,
			name = page.rabbitHole || page.Page || page.Program;
		this.titles[i] = {
			text: page.Title + " " + pluck(page.Keywords.results, "Label").join(" "),
			value: page.Path,
			renderText: page.Title
		};

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

Pages.prototype.create = function ( path ) {
	var regNormalize = /[^a-zA-Z0-9_-]/g,
		self = this;

	sweetAlert({
		title: "New page",
		text: "Give it a name:",
		type: "input",
		closeOnConfirm: false,
		showCancelButton: true
	}, function ( title ) {
		if ( title === false ) {
			return false;
		}
		if ( title === "" || ( title.length && title.length < 2 ) ) {
			sweetAlert.showInputError("Please enter a page title (of at least 2 characters)!");
			return false;
		}
		var firstTry = title.replace(regNormalize, "");

		sweetAlert({
			title: "Perfect!",
			text: "Now let\'s shorten it to make the URL easier to manage (example provided).",
			type: "input",
			closeOnConfirm: false,
			showCancelButton: true,
			inputValue: firstTry,
			confirmButtonText: "Continue",
			cancelButtonText: "I want off this ride"
		}, function ( newName ) {
			if ( newName === false ) {
				return false;
			}
			if ( newName === "" || ( newName.length && newName.length < 2 ) ) {
				sweetAlert.showInputError("Are you trying to cancel or do you just want me to use what we already have so far?");
				return false;
			}

			path += "/" + newName.replace(regNormalize, "");
			var pathArray = path.slice(1).split("/");

			var data = {
				'__metadata': {
					'type': self.current.listItemType
				},
				'Title': title,
				'Overview': '### New Page :)\n#### Joy',
				'Section': pathArray.shift() || "",
				'Program': pathArray.shift() || "",
				'Page': pathArray.shift() || "",
				'rabbitHole': pathArray.shift() || ""
			};

			sweetAlert({
				title: "Confirm",
				text: misc.md.render("Your page will have the title:\n\n**`" + title + "`**\n\nPage location: **`" + path + "`**\n"),
				closeOnConfirm: false,
				showCancelButton: true,
				showLoaderOnConfirm: true,
				html: true,
				type: "warning"
			}, function () {
				events.emit("create", data, path, title);
			});
		});
	});
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
