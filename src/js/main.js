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
	codeMirror = misc.codeMirror,

	pages = require("./pages"),
	events = require("./events"),
	DOM = require("./dom"),
	pageInit = require("./data"),

	router = Router({
		'/': {
			on: function () {
				DOM.setState({
					nextPath: "/",
					level: 0,
					parent: ""
				});
				events.emit("content.loading", "/");
			}
		},
		'/(\\w+)': {
			on: function ( section ) {
				var path = "/" + section.replace(/\s/g, "");
				DOM.setState({
					nextPath: path,
					level: 1,
					parent: ""
				});
				events.emit("content.loading", path);
			},
			'/(\\w+)': {
				on: function ( section, program ) {
					var path = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "");
					DOM.setState({
						nextPath: path,
						level: 2,
						parent: path
					});
					events.emit("content.loading", path);
				},
				'/(\\w+)': {
					on: function ( section, program, page ) {
						var path = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, "");
						DOM.setState({
							nextPath: path,
							level: 3,
							parent: "/" + section + "/" + program
						});
						events.emit("content.loading", path);
					},
					'/(\\w+)': {
						on: function ( section, program, page, rabbitHole ) {
							var path = "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, "") + "/" + rabbitHole.replace(/\s/g, "");
							DOM.setState({
								nextPath: path,
								level: 4,
								parent: "/" + section + "/" + program
							});
							events.emit("content.loading", path);
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
	DOM.setState({
		revertScroll: DOM.rootNode.getBoundingClientRect().top,
		opened: Object.keys(pages.parents).reduce(function ( paths, path ) {
			paths[path] = (DOM.state.parent === path);
			return paths;
		}, {})
	})
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

	var pubs = [], pub;
	while ( pub = misc.regPubs.exec(obj.Policy) ) {
		pubs.push(pub);
	}

	pages.current = pages.current.reset({
		ID: obj.ID,
		Title: obj.Title || "",
		_title: obj.Title || "",
		Pubs: pubs.join(" ") || "",
		Tags: obj.Tags && obj.Tags.replace(misc.regSplit, ", ").replace(/,$/, "") || "",
		Icon: obj.Icon || "",
		text: obj.Overview || "",
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
		type: "Overview",
		Modified: new Date(obj.Modified || obj.Created),
		listItemType: obj.__metadata.type,
		timestamp: (Date && Date.now() || new Date()),
		path: path,
		level: Number(Boolean(obj.Section)) + Number(Boolean(obj.Program)) + Number(Boolean(obj.Page)) + Number(Boolean(obj.rabbitHole)) || 0
	});

	misc.inTransition.output = false;
	document.title = pages.current.Title;
	DOM.setState({
		path: path,
		nextPath: "",
		opened: Object.keys(pages.parents).reduce(function ( paths, path ) {
			paths[path] = ( DOM.state.parent === path || DOM.state.opened[path] );
			return paths;
		}, {})
	});
	DOM.renderOut(pages.current.text, pages.current.type);
	if ( pages.options.scrollOnNav ) {
		window.scrollBy(0, DOM.content.getBoundingClientRect().top);
	}
});

events.on("tab.change", function ( page ) {
	var content = {};
	content[pages.current.type] = pages.current.text;
	content.type = page;
	content.text = pages.current[page];
	pages.current.set(content);

	misc.inTransition.output = false;
	DOM.setState({
		tab: page
	}, true, false);
	//if ( !codeMirror ) {
		DOM.renderOut(content.text, content.type);
	//}
});

pageInit();
