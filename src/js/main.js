var h = require("virtual-dom/h"),
	diff = require("virtual-dom/diff"),
	patch = require("virtual-dom/patch"),
	createElement = require("virtual-dom/create-element"),
	reqwest = require("reqwest"),
	Router = require("director/build/director").Router,
	console = console || require("console"),
	sweetAlert = require("sweetalert"),
	horsey = require("horsey"),

	misc = require("./helpers"),
	inTransition = misc.inTransition,
	codeMirror = misc.codeMirror,

	data = require("./data"),
	sitePath = data.sitePath,
	digest = data.digest,

	pages = require("./store").pages,
	events = require("./store").events,
	current = pages.current,

	DOM = require("./domStore"),
	dirtyDOM = null,
	rootNode = null,
	navDOM = null,
	render = require("./page").render,
	renderEditor = require("./page").editor,
	renderNav = require("./nav"),
	renderTabs = require("./tabs"),
	tabsDOM = renderTabs([
		{
			title: "Overview",
			icon: "home"
		}
	], { style: { display: "none" } }),
	router = Router({
		'/': {
			on: function () {
				events.emit("content.loading", "/");
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
		after: resetPage,
		notfound: function () {
			sweetAlert({
				title: "Oops",
				text: "Page doesn\'t exist.  Sorry :(\n\nI\'ll redirect you to the homepage instead.",
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
	cancelButtonText: "Nope.",
	confirmButtonText: "Yes!"
});

events.on("*.loading", function () {
	var target = DOM.output;
	if ( inTransition.output === true ) {
		return false;
	}
	inTransition.output = true;
	inTransition.tmp = target.innerHTML;
	target.innerHTML = "<div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div>";
	target.className += " loading";
});

events.on("*.loaded", function () {
	var regLoading = / ?loading/gi;
	var target = DOM.output;
	inTransition.output = false;
	target.className = target.className.replace(regLoading, "");
});

events.on("page.success", function ( data ) {
	pages.init(data);
	//navDOM = renderNav(pages.sections);
	DOM.set({
		nav: pages.sections
	});
	DOM.render();
	pageSetup();
});

events.on("missing", function ( path ) {
	sweetAlert({
		title: "Uh oh",
		text: path + " doesn't seem to match any of our pages.  Try the search!  For now I'll just load the homepage for you.",
		confirmButtonText: "OK!",
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
			window.open(obj.Link, "_blank");
			return false;
		});
	}
	var subLinks = document.querySelectorAll(".ph-page.link, .ph-rabbit-hole.link");
	var tabCurrent = document.querySelector(".tab-current");
	var i = 0;
	total = subLinks.length;
	for ( ; i < total; ++i ) {
		subLinks[i].style.display = "none";
	}
	if ( tabCurrent ) {
		tabCurrent.className = tabCurrent.className.replace(/ ?tab\-current/gi, "");
	}

	current.set({
		id: obj.ID,
		title: obj.Title || "",
		_title: obj.Title || "",
		keywords: (obj.Keywords && obj.Keywords.results) || [],
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
		listItemType: obj.__metadata.type,
		timestamp: (Date && Date.now() || new Date())
	});

	DOM.render({
		tabs: ( current.program !== "" ) ? null : { style: { display: "none" } }
	});

	resetPage();
	insertContent(current.text, current.type);

	var activeLink = document.querySelector("#ph-nav a[href='" + window.location.hash + "']");
	var currentTab = document.querySelector("#ph-tabs .icon-home");
	if ( activeLink ) {
		activeLink.className += " active";
	}
	if ( currentTab ) {
		currentTab.parentNode.className += " tab-current";
	}

	var hashArray = window.location.hash.slice(2).split(/\//),
		total;

	if ( hashArray.length > 1 ) {
		var phPage = document.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
		if ( phPage ) {
			i = 0;
			total = phPage.length;
			for ( ; i < total; ++i ) {
				phPage[i].removeAttribute("style");
				phPage[i].parentNode.removeAttribute("style");
			}
		}
	}

	document.title = current.title;

	if ( codeMirror ) {
		setupEditor();
	}
});

events.on("content.created", function ( path, title ) {
	sweetAlert({
		title: "Success!",
		text: title + " was created at <a href=\'#" + path + "\' target=\'_blank\'>" + path + "<\/a>",
		type: "success",
		html: true
	});
});

events.on("tab.change", function ( page ) {
	var content = {};
	content[current.type.toLowerCase()] = current.text;
	content.text = current[page.toLowerCase()];
	content.type = page;
	current.set(content);
	insertContent(current.text, current.type);
	if ( codeMirror ) {
		setupEditor();
	}
});

/*function Loader () {}
Loader.prototype.init = function () {
	return createElement(
		h("#ph-loader.loader-group", [
			h(".bigSqr", [
				h(".square.first"),
				h(".square.second"),
				h(".square.third"),
				h(".square.fourth")
			]),
			h(".text", ["loading..."])
		])
	);
};
Loader.prototype.update = function ( prev, el ) {
	if ( inTransition.output ) {

	}
};*/

function update ( e ) {
	var val = e.getValue();
	insertContent(val, current.type);
	current.set({
		text: val
	});
}

function insertContent ( text, type ) {
	DOM.output.innerHTML = misc.md.render("## " + type + "\n" + text);
}

function pageSetup () {
	DOM.init();

	var activeLink = document.querySelector("#ph-nav a[href='" + window.location.hash + "']");
	var tabCurrent = document.querySelector("#ph-tabs a.icon-overview");
	if ( activeLink ) {
		activeLink.className += " active";
	}
	if ( tabCurrent ) {
		tabCurrent.parentNode.className += " tab-current";
	}

	var hashArray = window.location.hash.slice(2).split(/\//),
		i,
		total;

	if ( hashArray.length > 1 ) {
		var phPage = document.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
		if ( phPage ) {
			i = 0;
			total = phPage.length;
			for ( ; i < total; ++i ) {
				phPage[i].removeAttribute("style");
				phPage[i].parentNode.removeAttribute("style");
			}
		}
	}

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

	horsey(document.getElementById("ph-search"), {
		suggestions: pages.titles,
		getValue: function ( item ) {
			return item.value;
		},
		getText: function ( item ) {
			return item.text;
		},
		set: function ( item ) {
			router.setRoute(item);
			return false;
		},
		render: function ( li, item ) {
			li.innerText = li.textContent = item.renderText;
		}
	});

}

function setupEditor () {
	console.log("Loading editor...");
	if ( DOM.editor ) {
		var wrap = DOM.editor.getWrapperElement();
		wrap.parentNode.removeChild(wrap);
		DOM.set({
			editor: null
		});
	}
	var refreshDOM = renderEditor(navDOM, tabsDOM, current.title, current.text);

	//DOM.updateDom(dirtyDOM, refreshDOM);

	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	DOM.reset();

	DOM.set({
		editor: codeMirror.fromTextArea(DOM.textarea, {
			mode: 'gfm',
			lineNumbers: false,
			matchBrackets: true,
			lineWrapping: true,
			theme: "neo",
			extraKeys: { "Enter": "newlineAndIndentContinueMarkdownList" }
		})
	});
	DOM.editor.on("change", update);
	DOM.editor.refresh();
	DOM.buttons.childNodes[0].removeAttribute("style");
	console.log("Editor loaded");
}

function resetPage () {
	console.log("Page reset");
	var oldActive = document.querySelectorAll("a.active"),
		i = 0,
		total = oldActive.length;
	for ( ; i < total; ++i ) {
		oldActive[i].className = oldActive[i].className.replace(/ ?active/gi, "");
	}
	if ( codeMirror ) {
		if ( DOM.editor ) {
			var wrap = DOM.editor.getWrapperElement();
			wrap.parentNode.removeChild(wrap);
			DOM.set({
				editor: null
			});
		}
		var refreshDOM = renderEditor(navDOM, tabsDOM, current.title, current.text);
	}
	else {
		refreshDOM = render(navDOM, tabsDOM, current.title);
	}
	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	DOM.reset();
}

events.emit("page.loading");
