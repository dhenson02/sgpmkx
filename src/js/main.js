var h = require("virtual-dom/h"),
	diff = require("virtual-dom/diff"),
	patch = require("virtual-dom/patch"),
	reqwest = require("reqwest"),
	Router = require("director/build/director").Router,
	console = console || require("console"),
	sweetAlert = require("sweetalert"),
	horsey = require("horsey"),

	misc = require("./helpers"),
	inTransition = misc.inTransition,
	codeMirror = misc.codeMirror,

	pages = require("./store").pages,
	events = require("./store").events,
	current = pages.current,

	DOM = require("./domStore"),
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

events.on("page.success", function () {
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

	resetPage();
	DOM.renderOut(current.text, current.type);

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

	DOM.update();
});

events.on("tab.change", function ( page ) {
	var content = {};
	content[current.type.toLowerCase()] = current.text;
	content.text = current[page.toLowerCase()];
	content.type = page;
	current.set(content);
	DOM.renderOut(current.text, current.type);
	if ( codeMirror ) {
		DOM.update();
	}
});


/*function renderLoader() {
 return (
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
 }*/

function resetPage () {
	var oldActive = document.querySelectorAll("a.active"),
		i = 0,
		total = oldActive.length;
	for ( ; i < total; ++i ) {
		oldActive[i].className = oldActive[i].className.replace(/ ?active/gi, "");
	}
	DOM.update();
}

events.on("content.loading", function () {
	if ( inTransition.output ) {
		return false;
	}
	inTransition.output = DOM.output.innerHTML;
	DOM.output.className += " loading";
	DOM.output.innerHTML = "<div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div>";
});

events.on("content.loaded", function () {
	var regLoading = / ?loading/gi;
	inTransition.output = null;
	DOM.output.className = DOM.output.className.replace(regLoading, "");
});

events.emit("page.loading");
