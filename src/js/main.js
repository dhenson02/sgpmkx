'use strict';

const vdom = require("virtual-dom");
const h = vdom.h;
const diff = vdom.diff;
const patch = vdom.patch;

const sweetAlert = require("sweetalert");
const fastdom = require("fastdom");
const misc = require("./helpers");

const {
    router
} = require("./router");

const {
    emitEvent,
    // listenFor,
    events
} = require('./events');

const pages = require("./pages");
const DOM = require("./dom");
const pageInit = require("./data-handler");


sweetAlert.setDefaults({
	allowOutsideClick: true,
	showCancelButton: true,
	cancelButtonText: "No",
	confirmButtonText: "Yes!"
});

events.on("page.loaded", function () {
	DOM.init();
	if ( window.location.hash ) {
		router.init();
	}
	else {
		router.init("/");
	}
});

events.on("missing", function ( path ) {
	sweetAlert({
		'title': "Uh oh",
		'text': path + " doesn't seem to match any of our pages.  Try the search!  For now I'll just load the homepage for you.",
		'confirmButtonText': "Shucks!",
		'allowOutsideClick': false,
		'allowEscapeKey': false,
		'showCancelButton': false
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
		pubs = ( pubs ) ?
			pubs + "," + pub :
			pub;
	}

	pages.current = pages.current.reset({
		ID: obj.ID,
		Title: obj.Title || "",
		_title: obj.Title || "",
		Pubs: pubs || "",
		Tags: obj.Tags && obj.Tags.replace(misc.regSpaces, "").replace(misc.regPubs, "").replace(misc.regSplit, ",") || "",
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
		paths[ path ] = (
			DOM.state.nextParent === path ? true : (
				!pages.options.resetOpenOnNav ? DOM.state.opened[ path ] : false
			)
		);
		return paths;
	}, {});
	DOM.setState({
		path: DOM.state.nextPath,
		level: DOM.state.nextLevel,
		parent: DOM.state.nextParent,
		nextPath: "",
		nextLevel: null,
		nextParent: "",
		opened: opened,
		contentChanging: false,
		tagsLocked: (pages.current.Tags.length > 1)
	});
	document.title = pages.current.Title;
	if ( pages.options.scrollOnNav ) {
		var scrollTop = DOM.rootNode.getBoundingClientRect().top - 50;
		fastdom.write(function () {
			window.scrollBy(0, scrollTop);
		});
		/*var scrollTop = DOM.rootNode.getBoundingClientRect().top - 50;
		var interval = 300 / scrollTop;
		var positive = ( scrollTop > 0 );
		(function phScroller( top ) {
			setTimeout(function () {
				window.scrollBy(0, interval);
				top = top - interval;
				return ( ( positive && top < scrollTop ) || ( !positive && top > scrollTop ) ? phScroller(top) : false);
			}, 16);
			console.log(top);
		})(scrollTop);*/
	}
	emitEvent("tab.change", "Overview");
});

events.on("tab.change", function ( tab ) {
	DOM.setState({
		tab: tab,
		text: pages.current[ tab ]
	}, true, false, true, true);
});

events.on("content.found", function ( path ) {
	router.setRoute(path);
});

pageInit();

