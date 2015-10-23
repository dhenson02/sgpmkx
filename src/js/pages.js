var misc = require("./helpers"),
	events = require("./events");

function Content ( data ) {
	if ( !(this instanceof Content) ) {
		return new Content( data );
	}
	this.ID = -1;
	this.Title = "";
	this._title = "";
	this.text = "";
	this.Pubs = "";
	this.Tags = "";
	this.Icon = "";
	this.Overview = "";
	this.Policy = "";
	this.Training = "";
	this.Resources = "";
	this.Tools = "";
	this.Contributions = "";
	this.Section = "";
	this.Program = "";
	this.Page = "";
	this.rabbitHole = "";
	this.type = "Overview";
	this.Modified = new Date();
	this.listItemType = "";
	this.timestamp = null;
	this.level = -1;
	this.path = "/";
	if ( data ) {
		return this.set(data);
	}
}

Content.prototype.set = function ( data ) {
	var i = 0;
	for ( var name in data ) {
		if ( this.hasOwnProperty(name) ) {
			this[name] = ( typeof data[name] === "string" ) ? data[name].trim() : data[name];
			if ( pages[this.path].hasOwnProperty(name) ) {
				pages[this.path][name] = ( typeof data[name] === "string" ) ? data[name].trim() : data[name];
				++i;
			}
		}
	}
	if ( i > 0 ) pages.navPrep();
	return this;
};

Content.prototype.reset = function ( data ) {
	return new Content(data);
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
		saveTitleAfterEdit: true,
		saveTagsAfterEdit: true,
		scrollOnNav: false
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
		result.path = "/" + (( result.Section !== "" ) ?
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
		result.level = result.path.split(/\/\w+/g).length - 1;

		/**
		 * This allows direct access using the URI without having to manipulate
		 * anything (aside from whitespace removal) or search/test for a match.
 		 */

		self.urls.push(result.path);
		self[result.path] = result;
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
		if ( result.level === 1 ) {
			self.sections[result.Section] = {
				path: ( !result.Link ) ? "/" + result.Section : result.Link,
				title: result.Title,
				id: result.ID,
				links: []
			};
		}
		if ( result.level === 4 ) {
			self.subParents["/" + result.Section + "/" + result.Program + "/" + result.Page] = ".ph-sub-parent.ph-page";
		}
		else if ( result.level === 3 ) {
			self.parents["/" + result.Section + "/" + result.Program] = ".ph-parent.ph-program";
		}
	}

	var tags = result.Tags && result.Tags.split(misc.regSplit) || [],
		pubs = [],
		pub;

	while ( pub = misc.regPubs.exec(result.Policy) ) {
		pubs.push(pub);
	}

	/**
	 * Used for searching the site quick and easy using Horsey.
	 */
	self.titles.push({
		text: result.Title + " " + tags.join(" ") + pubs.join(" "),
		value: result.path,
		renderText: result.Title
	});

	url = null;
	result = null;
	self.urls.sort();
	self.urls.forEach(function ( url ) {
		var page = self[url],
			className,
			path = url.split(/\//),
			name = path.slice(-1),
			parent = path.slice(0, -1).join("/"),
			grandParent = path.slice(0, -2).join("/");

		switch ( page.level ) {
			case 2:
				className = self.parents[page.path] || ".ph-program";
				break;
			case 3:
				className = self.subParents[page.path] || ".ph-page";
				break;
			case 4:
				className = ".ph-rabbit-hole";
				break;
		}

		if ( page.level > 1 ) {
			self.sections[page.Section].links.push({
				path: page.path,
				href: ( !page.Link ) ? "#" + page.path : page.Link,
				title: page.Title,
				level: page.level,
				className: className,
				name: name,
				parent: ( !self.subParents[parent] ? parent : grandParent ),
				children: ( self.parents[page.path] ),
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
