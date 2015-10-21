/**
 * @license
 * Test
 */
/**
 * Test2
 * @license
 */

/**
 * @preserve
 * TestP
 */
/**
 * TestP2
 * @preserve
 */
var vdom = require("virtual-dom/dist/virtual-dom"),
	h = vdom.h,
	diff = vdom.diff,
	patch = vdom.patch,
	Router = require("director/build/director").Router,
	sweetAlert = require("sweetalert"),
	horsey = require("horsey"),

	misc = require("./helpers"),
	inTransition = misc.inTransition,
	codeMirror = misc.codeMirror,

	pages = require("./pages"),
	events = require("./events"),
	DOM = require("./dom"),
	pageInit = require("./data"),

	router = Router({
		'/': {
			on: function () {
				events.emit("content.loading", "/");
			}
		},
		'/(\\w+-dev)': {
			on: function ( dev ) {
				events.emit("content.loading", "/" + (codeMirror ? dev : dev.slice(0,-4)));
			}
		},
		'/(\\w+)': {
			on: function ( section ) {
				events.emit("content.loading", "/" + section.replace(/\s/g, ""));
			},
			'/(\\w+)': {
				on: function ( section, program ) {
					events.emit("content.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, ""));
				},
				'/(\\w+)': {
					on: function ( section, program, page ) {
						events.emit("content.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, ""));
					},
					'/(\\w+)': {
						on: function ( section, program, page, rabbitHole ) {
							events.emit("content.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, "") + "/" + rabbitHole.replace(/\s/g, ""));
						}
					}
				}
			}
		}
	}).configure({
		strict: false,
		notfound: function () {
			sweetAlert({
				title: "Oops",
				text: "Page doesn\'t exist.  Sorry :( \nI\'ll redirect you to the homepage instead.",
				timer: 2000,
				showConfirmButton: false,
				showCancelButton: false,
				allowOutsideClick: true
			}, function () {
				router.setRoute("/");
			});
		}
	});

sweetAlert.setDefaults({
	allowOutsideClick: true,
	showCancelButton: true,
	cancelButtonText: "No",
	confirmButtonText: "Yes!"
});

events.on("page.loaded", function () {
	DOM.init();
	if ( window.location.hash ) {
		/**
		 * Example:  copy + paste URL to
		 * https://kx.afms.mil/kj/kx7/PublicHealth/[...]/#/FH/TravelMedicine
		 */
		router.init();
	}
	else {
		/**
		 * Example:  copy + paste URL to
		 * https://kx.afms.mil/kj/kx7/PublicHealth/[...]
		 */
		router.init("/");
	}
	horsey(DOM.searchInput, {
		suggestions: pages.titles,
		autoHideOnBlur: false,
		limit: 8,
		getValue: function ( item ) {
			return item.value;
		},
		getText: function ( item ) {
			return item.text;
		},
		set: function ( item ) {
			router.setRoute(item);
			DOM.searchInput.value = "";
			return false;
		},
		render: function ( li, item ) {
			li.innerText = li.textContent = item.renderText;
		}
	});
});

events.on("missing", function ( path ) {
	sweetAlert({
		title: "Uh oh",
		text: path + " doesn't seem to match any of our pages.  Try the search!  For now I'll just load the homepage for you.",
		confirmButtonText: "Shucks!",
		allowOutsideClick: false,
		allowEscapeKey: false,
		showCancelButton: false
	}, function () {
		router.setRoute("/");
	});
});

events.on("content.loaded", function ( data, path ) {
	var obj = data.d;
	if ( !obj ) {
		router.setRoute("/");
		return false;
	}
	if ( obj.Link ) {
		window.open(obj.Link, "_blank");
		return false;
	}

	pages.current = pages.current.reset({
		id: obj.ID,
		title: obj.Title || "",
		_title: obj.Title || "",
		keywords: (obj.Keywords && obj.Keywords.results) || [],
		references: (obj.References && obj.References.results) || [],
		icon: obj.Icon || "",
		text: obj.Overview || "",
		overview: obj.Overview || "",
		policy: obj.Policy || "",
		training: obj.Training || "",
		resources: obj.Resources || "",
		tools: obj.Tools || "",
		contributions: obj.Contributions || "",
		section: obj.Section || "",
		program: obj.Program || "",
		page: obj.Page || "",
		rabbitHole: obj.rabbitHole || "",
		type: "Overview",
		_type: "overview",
		modified: new Date(obj.Modified || obj.Created),
		listItemType: obj.__metadata.type,
		timestamp: (Date && Date.now() || new Date())
	});

	inTransition.output = false;
	if ( window.pageYOffset > DOM.content.offsetTop ) {
		window.scroll(0, DOM.content.offsetTop);
	}
	document.title = pages.current.title;
	DOM.setState({
		path: path,
		level: Number(Boolean(obj.Section)) + Number(Boolean(obj.Program)) + Number(Boolean(obj.Page)) + Number(Boolean(obj.rabbitHole)) || 0
	});
	if ( !codeMirror ) {
		DOM.renderOut(pages.current.text, pages.current.type);
	}
});

events.on("tab.change", function ( page ) {
	var content = {};
	content[pages.current._type] = pages.current.text;
	content.type = page;
	content._type = page.replace(/\s/g, "").toLowerCase().trim();
	content.text = pages.current[content._type];
	pages.current.set(content);

	inTransition.output = false;
	DOM.update();
	if ( !codeMirror ) {
		DOM.renderOut(content.text, content.type);
	}
});

pageInit();
