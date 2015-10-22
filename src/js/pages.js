var misc = require("./helpers"),
	events = require("./events");

function Content ( data ) {
	if ( !(this instanceof Content) ) {
		return new Content( data );
	}
	this.id = -1;
	this.title = "";
	this._title = "";
	this.pubs = "";
	this.tags = "";
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
	this._type = "overview";
	this.modified = new Date();
	this.listItemType = "";
	this.timestamp = null;
	this.level = -1;
	this.path = "";
	if ( data ) {
		return this.set(data);
	}
}

Content.prototype.set = function ( data ) {
	for ( var name in data ) {
		if ( this.hasOwnProperty(name) ) {
			this[name] = ( typeof data[name] === "string" ) ? data[name].trim() : this[name] = data[name];
		}
	}
	return this;
};

Content.prototype.reset = function ( data ) {
	return new Content(data);
};

Content.prototype.savePage = function () {
	var pubs = [], pub;
	while ( pub = misc.regPubs.exec(this.policy) ) {
		pubs.push(pub);
	}
	this.set({
		text: this.text.trim(),
		title: this.title.trim(),
		pubs: pubs.join(" "),
		tags: this.tags.trim(),
		modified: new Date()
	});
	this[this._type] = this.text;
	var data = {
		'__metadata': {
			'type': this.listItemType
		},
		'Title': this.title,
		'Pubs': this.pubs,
		'Tags': this.tags,
		'Overview': this.overview,
		'Policy': this.policy,
		'Training': this.training,
		'Resources': this.resources,
		'Tools': this.tools,
		'Contributions': this.contributions
	};
	//self.className += " loading";
	//var el = self.children[0];
	events.emit("content.save", data);
};

function Pages () {
	if ( !(this instanceof Pages) ) {
		return new Pages();
	}
	this.current = new Content();
	this.options = {
		hideEmptyTabs: true,
		searchPlaceholder: "Search using keywords, AFIs or titles...",
		emptyTabsNotify: false,
		images: "/kj/kx7/PublicHealth/SiteAssets/Images",
		contribPOCName: "Jane Dizoe",
		contribPOCEmail: "joe.dirt@example.com",
		contribEmailSubject: "Contribution to PH Kx",
		contribEmailBody: "I thought this amazing tool I made could benefit others.  Here's why:\n\n",
		hideSearchWhileEditing: true,
		hideNavWhileEditing: true,
		saveTitleAfterEdit: true
	};
}

Pages.prototype.set = function ( data, ctx ) {
	var self = ctx || this;
	for ( var name in data ) {
		if ( self.hasOwnProperty(name) ) {
			if ( !ctx ) {
				self[name] = data[name];
			}
			else {
				self[name] = (
					( data[name] === "yes" || data[name] === "true" ) ? true :
						( data[name] === "no" || data[name] === "false" ) ? false : data[name]
				);
			}
		}
	}
};

Pages.prototype.setOption = function ( data ) {
	this.set(data, this.options);
};

Pages.prototype.init = function ( data ) {
	var self = this;
	this.urls = [];
	this.parents = {};
	this.subParents = {};
	this.sections = {};
	this.titles = [];
	data.d.results.forEach(function ( result ) {
		if ( !misc.codeMirror && !result.Published ) {
			return false;
		}
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

		/**
		 * Quite obviously the `Level` will be equal to the number of
		 * segments created by `/Page` there are.  Path will be `/Page/Here`
		 * which translates to an array of [ "", "Page", "Here" ] because
		 * of the first `/`.
		 * @type {number}
		 */
		result.Level = result.Path.split(/\/\w+/g).length - 1;

		/**
		 * This allows direct access using the URI without having to manipulate
		 * anything (aside from whitespace removal) or search/test for a match.
 		 */
		self[result.Path] = result;
		self.urls.push(result.Path);

		var tags = result.Tags && result.Tags.replace(misc.regSplit, " ") || "",
			pubs = [],
			pub;

		while ( pub = misc.regPubs.exec(result.Policy) ) {
			pubs.push(pub);
		}

		/**
		 * Used for searching the site quick and easy using Horsey.
		 */
		self.titles.push({
			text: result.Title + " " + tags + pubs.join(" "),
			value: result.Path,
			renderText: result.Title
		});
	});
	this.navPrep();
	events.emit("page.loaded");
};

Pages.prototype.navPrep = function () {
	var self = this;
	var _urls = self.urls.slice(0);
	var url, result;
	while ( url = _urls.shift() ) {
		result = self[url];
		if ( result.Level === 1 ) {
			self.sections[result.Section] = {
				path: ( !result.Link ) ? "/" + result.Section : result.Link,
				title: result.Title,
				id: result.ID,
				links: []
			};
		}
		if ( result.rabbitHole !== "" ) {
			self.subParents["/" + result.Section + "/" + result.Program + "/" + result.Page] = ".ph-sub-parent.ph-page";
		}
		else if ( result.Page !== "" ) {
			self.parents["/" + result.Section + "/" + result.Program] = ".ph-parent.ph-program";
		}
	}
	url = null;
	result = null;
	self.urls.sort();
	self.urls.forEach(function ( url ) {
		var page = self[url],
			className,
			name = url.split(/\//).pop();

		switch ( page.Level ) {
			case 2:
				className = self.parents[page.Path] || ".ph-program";
				break;
			case 3:
				className = self.subParents[page.Path] || ".ph-page";
				break;
			case 4:
				className = ".ph-rabbit-hole";
				break;
		}

		if ( page.Level > 1 ) {
			self.sections[page.Section].links.push({
				path: page.Path,
				href: ( !page.Link ) ? "#" + page.Path : page.Link,
				title: page.Title,
				level: page.Level,
				className: className,
				name: name,
				parent: url.split(/\//).slice(-2, -1),
				id: page.ID,
				icon: page.Icon || ""
			});
		}
	});
};

Pages.prototype.createContent = function ( path, title, newName ) {
	var regNormalize = /[^a-zA-Z0-9_-]/g,
		self = this,
		title = "Blamo";

	var firstTry = title.replace(regNormalize, "");
	path += "/" + newName.replace(regNormalize, "");
	var pathArray = path.slice(1).split("/");
	//var tags = ;

	var data = {
		'__metadata': {
			'type': self.current.listItemType
		},
		'Title': title,
		//'Keywords': tags,
		'Overview': '### New Page :)\n#### Joy',
		'Section': pathArray.shift() || "",
		'Program': pathArray.shift() || "",
		'Page': pathArray.shift() || "",
		'rabbitHole': pathArray.shift() || ""
	};
	events.emit("content.create", data, path, title);
};

/*

Pages.prototype.createContent = function ( path ) {
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
			var tags = null;

			var data = {
				'__metadata': {
					'type': self.current.listItemType
				},
				'Title': title,
				//'Tags': tags || [],
				'Overview': '### New Page :)\n#### Joy',
				'Section': pathArray.shift() || "",
				'Program': pathArray.shift() || "",
				'Page': pathArray.shift() || "",
				'rabbitHole': pathArray.shift() || ""
			};
			sweetAlert({
				title: "Confirm",
				text: misc.md.render("Your page will have the title: **" + title + "**\n > Page location: *`" + path + "`*\n"),
				closeOnConfirm: false,
				showCancelButton: true,
				showLoaderOnConfirm: true,
				html: true,
				type: "warning"
			}, function () {
				events.emit("content.create", data, path, title);
			});
		});
	});
};
*/

var pages = new Pages();

module.exports = pages;

/**
 * For Tools:
 *  Calculators
 *  Checklists
 *  Forms
 *  Templates
 *  Trackers
 */
