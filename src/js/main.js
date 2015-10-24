/**
 * @license
 * Test but it'd be MIT if anything.
 */
var vdom = require("virtual-dom"),
	h = vdom.h,
	diff = vdom.diff,
	patch = vdom.patch,
	Router = require("director/build/director").Router,
	sweetAlert = require("sweetalert"),
	horsey = require("horsey"),

	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events"),
	DOM = require("./dom"),
	pageInit = require("./data"),

	router = Router({
		'/': {
			on: function () {
				events.emit("content.loading", "/", 0, "");
			}
		},
		'/(\\w+)': {
			on: function ( section ) {
				var path = "/" + section.replace(/\s/g, "");
				events.emit("content.loading", path, 1, "");
			},
			'/(\\w+)': {
				on: function ( section, program ) {
					var path = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "");
					events.emit("content.loading", path, 2, path);
				},
				'/(\\w+)': {
					on: function ( section, program, page ) {

						var parent = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, ""),
							path = parent + "/" + page.replace(/\s/g, "");
						events.emit("content.loading", path, 3, parent);
					},
					'/(\\w+)': {
						on: function ( section, program, page, rabbitHole ) {
							var parent = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, ""),
								path = parent + "/" + page.replace(/\s/g, "") + "/" + rabbitHole.replace(/\s/g, "");
							events.emit("content.loading", path, 4, parent);
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
});

events.on("dom.loaded", function () {
	if ( window.location.hash ) {
		router.init();
	}
	else {
		router.init("/");
	}
	horsey(DOM.searchInput, {
		suggestions: pages.titles,
		autoHideOnBlur: false,
		limit: 6,
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
	if ( pages.options.scrollOnNav ) {
		DOM.setState({
			revertScroll: DOM.rootNode.getBoundingClientRect().top
			/*opened: Object.keys(pages.parents).reduce(function ( paths, path ) {
			 paths[path] = (DOM.state.parent === path);
			 return paths;
			 }, {})*/
		})
	}
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

events.on("content.loaded", function ( data ) {
	var obj = data.d;
	if ( !obj ) {
		router.setRoute("/");
		return false;
	}
	if ( obj.Link ) {
		window.open(obj.Link, "_blank");
		return false;
	}

	var pubs = "", pub;
	while ( pub = misc.regPubs.exec(obj.Policy) ) {
		pubs += ", " + pub;
	}

	pages.current = pages.current.reset({
		ID: obj.ID,
		Title: obj.Title || "",
		_title: obj.Title || "",
		Pubs: pubs || "",
		Tags: obj.Tags && obj.Tags.replace(misc.regSplit, ", ").replace(/,$/, "") || "",
		Icon: obj.Icon || "",
		Overview: obj.Overview || "",
		Policy: obj.Policy || "",
		Training: obj.Training || "",
		Resources: obj.Resources || "",
		Tools: obj.Tools || "",
		Contributions: obj.Contributions || "",
		Section: obj.Section || "",
		Program: obj.Program || "",
		Page: obj.Page || "",
		rabbitHole: obj.rabbitHole || "",
		Modified: new Date(obj.Modified),
		listItemType: obj.__metadata.type,
		path: DOM.state.nextPath,
		level: DOM.state.nextLevel,
		parent: DOM.state.nextParent
	});
	var opened = Object.keys(pages.parents).reduce(function ( paths, path ) {
		paths[path] = ( (pages.options.scrollOnNav && pages.options.resetOpenOnNav) ? (DOM.state.nextParent === path) : DOM.state.opened[path] );
		return paths;
	}, {});
	DOM.setState({
		path: DOM.state.nextPath,
		level: DOM.state.nextLevel,
		parent: DOM.state.nextParent,
		nextPath: "",
		nextLevel: null,
		nextParent: "",
		contentChanging: false,
		opened: opened
	});
	document.title = pages.current.Title;
	if ( pages.options.scrollOnNav ) {
		window.scrollBy(0, DOM.content.getBoundingClientRect().top);
	}
	events.emit("tab.change", "Overview");
	if ( misc.codeMirror ) {
		DOM.initEditor();
	}
});

events.on("tab.change", function ( tab ) {
	DOM.setState({
		tab: tab
	});
	DOM.renderOut();
});

pageInit();
