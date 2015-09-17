try {
	var codeMirror = CodeMirror
}
catch ( e ) {
	var codeMirror = null;
}
var h = require("virtual-dom/h"),
	diff = require("virtual-dom/diff"),
	patch = require("virtual-dom/patch"),
	createElement = require("virtual-dom/create-element"),
	reqwest = require("reqwest"),
	Router = require("director/build/director").Router,
	console = console || require("console"),
	sweetAlert = require("sweetalert"),
	misc = require("./helpers"),
	Content = require("./store"),
	DOMRef = require("./domStore"),
	renderNav = require("./nav"),
	renderTabs = require("./tabs"),
	baseURL = _spPageContextInfo.webAbsoluteUrl,
	sitePath = baseURL + "/_api/lists/getByTitle('Content')",
	digest = document.getElementById("__REQUESTDIGEST").value,
	pages = {},
	parents = {},
	subParents = {},
	currentContent = new Content(),
	domRefs = new DOMRef(),
	dirtyDOM = null,
	rootNode = null,
	navDOM = null,
	tabsDOM = renderTabs([ "Overview" ], { style: { display: "none" } }, handleTab), /*{ Overview: 2 }*/
	router = null,
	inTransition = {};

sweetAlert.setDefaults({
	allowOutsideClick: true,
	showCancelButton: true,
	cancelButtonText: "Nope.",
	confirmButtonText: "Yes!"
});

function getList () {

	reqwest({
		url: sitePath + "/items",
		method: "GET",
		type: "json",
		contentType: "application/json",
		withCredentials: true,
		headers: {
			"Accept": "application/json;odata=verbose",
			"text-Type": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose"
		},
		success: function ( data ) {
			var results = data.d.results,
				urls = [],
				sections = {},
				i = 0,
				count = results.length,
				result;
			for ( ; i < count; ++i ) {
				result = results[i];

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
				pages[result.Path] = result;
				urls[i] = result.Path;

				if ( result.Section !== "" && result.Program === "" ) {
					sections[result.Section] = {
						path: ( !result.Link ) ? "#/" + result.Section : result.Link.Url,
						title: result.Title,
						links: []
					};
				}

				if ( result.rabbitHole !== "" ) {
					subParents["/" + result.Section + "/" + result.Program + "/" + result.Page] = "li.ph-sub-parent.ph-page-link";
				}
				else if ( result.Page !== "" ) {
					parents["/" + result.Section + "/" + result.Program] = "li.ph-parent";
				}

			}

			var sortedUrls = urls.sort();
			i = 0;
			for ( ; i < count; ++i ) {
				var li = "li";
				var page = pages[sortedUrls[i]];
				var isPage = false;
				if ( page.rabbitHole !== "" ) {
					isPage = true;
					li = "li.ph-rabbit-hole";
				}
				else if ( page.Page !== "" ) {
					isPage = true;
					li = subParents[page.Path] || "li.ph-page-link";
				}
				else if ( page.Program !== "" ) {
					li = parents[page.Path] || "li";
				}

				var attr = { style: { display: "none" } };
				if ( page.Link && page.Link.Url ) {
					attr["data-href"] = "#" + page.Path;
				}

				if ( page.Program !== "" ) {
					sections[page.Section].links.push({
						path: ( !page.Link ) ? "#" + page.Path : page.Link.Url,
						title: page.Title,
						li: li,
						attr: isPage ? attr : null,
						hr: isPage ? null : h("hr")
					});
				}
			}
			navDOM = renderNav(sections);
		},
		error: misc.connError,
		complete: function () {
			pageSetup();
		}
	});
}

function loadPage ( path ) {
	console.log("Begin loadPage...");
	if ( !pages[path] ) {
		sweetAlert({
			title: "Uh oh",
			text: "The address you entered doesn't seem to match any of our pages.  Try the search!  For now I'll just load the homepage for you.",
			confirmButtonText: "OK!",
			allowOutsideClick: false,
			allowEscapeKey: false
		}, function () {
			router.setRoute("/");
		});
		return false;
	}
	reqwest({
		url: sitePath + "/items(" + pages[path].ID + ")",
		method: "GET",
		type: "json",
		contentType: "application/json",
		withCredentials: true,
		headers: {
			"Accept": "application/json;odata=verbose",
			"text-Type": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose"
		},
		success: function ( data ) {
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
					window.open(obj.Link.Url, "_blank");
					return false;
				});
			}
			var subLinks = rootNode.querySelectorAll(".ph-page-link, .ph-rabbit-hole");
			var tabCurrent = rootNode.querySelector(".tab-current");
			var i = 0;
			total = subLinks.length;
			for ( ; i < total; ++i ) {
				subLinks[i].style.display = "none";
			}
			if ( tabCurrent ) {
				tabCurrent.className = tabCurrent.className.replace(/ ?tab\-current/gi, "");
			}

			currentContent.set({
				id: obj.ID,
				title: obj.Title || "",
				_title: obj.Title || "",
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

			var tabsStyle = ( currentContent.program !== "" ) ? null : { style: { display: "none" } };
			tabsDOM = renderTabs([
				"Overview",
				"Policy",
				"Training",
				"Resources",
				"Tools",
				"Contributions"
			], tabsStyle, handleTab);
			/*{
			 Overview: currentContent.overview.length,
			 Policy: currentContent.policy.length,
			 Training: currentContent.training.length,
			 Resources: currentContent.resources.length,
			 Tools: currentContent.tools.length,
			 Contributions: currentContent.contributions.length
			 }*/

			resetPage();
			insertContent(currentContent.text, currentContent.type);
			stopLoading(domRefs.output);

			try {
				rootNode.querySelector("#ph-nav a[href='" + window.location.hash + "']").className += " active";
				rootNode.querySelector("#ph-tabs a.icon-overview").parentNode.className += " tab-current";
			}
			catch ( e ) {
				console.log(e);
			}

			var hashArray = window.location.hash.slice(2).split(/\//);
			var total;
			if ( hashArray.length > 1 ) {
				var phPages = rootNode.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/'], #ph-nav [data-href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
				if ( phPages ) {
					i = 0;
					total = phPages.length;
					for ( ; i < total; ++i ) {
						phPages[i].removeAttribute("style");
						phPages[i].parentNode.removeAttribute("style");
					}
				}
				if ( hashArray.length > 2 ) {
					var phRabbitHoles = rootNode.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/" + hashArray[2] + "/'], #ph-nav [data-href^='#/" + hashArray[0] + "/" + hashArray[1] + "/" + hashArray[2] + "/']");
					if ( phRabbitHoles ) {
						i = 0;
						total = phRabbitHoles.length;
						for ( ; i < total; ++i ) {
							phRabbitHoles[i].removeAttribute("style");
							phRabbitHoles[i].parentNode.removeAttribute("style");
						}
					}
				}
			}

			document.title = currentContent.title;
		},
		error: misc.connError,
		complete: function () {
			if ( codeMirror ) {
				setupEditor();
			}
			/*if ( !initialized ) {
				setTimeout(function() {
					"use strict";
					var initLoader = document.getElementById("init-page-loader");
					initLoader.className = "animated fadeOut";
					setTimeout(function() {
						initLoader.parentNode.removeChild(initLoader);
						initialized = true;
					}, 300);
				}, 1500);
			}*/
		}
	});
}

router = Router({
	'/': {
		on: function () {
			loadPage("/");
		}
	},
	'/(\\w+)': {
		on: function ( section ) {
			loadPage("/" + section.replace(/\s/g, ""));
		},
		'/(\\w+)': {
			on: function ( section, program ) {
				loadPage("/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, ""));
			},
			'/(\\w+)': {
				on: function ( section, program, page ) {
					loadPage("/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, ""));
				},
				'/(\\w+)': {
					on: function ( section, program, page, rabbitHole ) {
						loadPage("/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, "") + "/" + rabbitHole.replace(/\s/g, ""));
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

function handleTab ( page ) {
	var content = {};
	content[currentContent.type.toLowerCase()] = currentContent.text;
	content.text = currentContent[page.toLowerCase()];
	content.type = page;
	currentContent.set(content);
	insertContent(currentContent.text, currentContent.type);
	if ( codeMirror ) {
		setupEditor();
	}
}

function render ( navDOM, tabsDOM, title, loader ) {
	return (
		h("#wrapper", [
			/*h("div#init-page-loader.animated.fadeIn", [
				h("div.loading-spinner", [
					h("div.dot.dotOne"),
					h("div.dot.dotTwo"),
					h("div.dot.dotThree")
				])
			]),*/
			h("#ph-side-nav", [navDOM]),
			h("#content.fullPage", [
				tabsDOM,
				h("h1#ph-title", [String(title || "")]),
				h("#contentWrap", [
					h("#output", [
						loader||null
					])
				])
			])
		])
	);
}

function renderEditor ( navDOM, tabsDOM, title, text, loader ) {
	return (
		h("#wrapper", [
			/*h("div#init-page-loader", [
				h("div.loading-spinner", [
					h("div.dot.dotOne"),
					h("div.dot.dotTwo"),
					h("div.dot.dotThree")
				])
			]),*/
			h("#ph-side-nav", [navDOM]),
			h("#content.fullPage", [
				h("#ph-buttons", [
					h("button#toggleButton.ph-btn", {
						onclick: editPage,
						style: { display: "none" }
					}, ["Edit page"]),
					h("div.clearfix"),
					h("button#cheatSheetButton.ph-btn", {
						onclick: toggleCheatSheet,
						type: "button"
					}, ["Markdown help"]),
					h("button#saveButton.ph-btn", {
						onclick: savePage,
						type: "button"
					}, ["Save"]),
					h("button#createButton.ph-btn", {
						onclick: createPage,
						type: "button"
					}, ["New"])
				]),
				tabsDOM,
				h("h1#ph-title", [String(title || "")]),
				h("label#titleFieldLabel", [
					"Page title: ",
					h("input#titleField", {
						onkeyup: updateTitle,
						value: String(title || ""),
						type: "text"
					})
				]),

				h("#cheatSheet", { style: { display: "none" } }, ["This will be a cheat-sheet for markdown"]),
				h("#contentWrap", [
					h("#input", [
						h("textarea#textarea", [String(text || "")])
					]),
					h("#output", [
						loader||null
					])
				])
			])
		])
	);
}

function renderLoader() {
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
}

/*function startLoading ( target ) {
	if ( inTransition[target.id] === true ) {
		return false;
	}
	inTransition[target.id] = true;
	if ( misc.regLoading.test(target.className) === false ) {
		inTransition["tmp"] = target.innerHTML;
		target.innerHTML = "<div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div>";
		target.className += " loading";
	}
}*/

function stopLoading ( target ) {
	inTransition[target.id] = false;
	target.className = target.className.replace(misc.regLoading, "");
}

function savePage ( event ) {
	var self = this;
	event = event || window.event;
	if ( event.preventDefault ) event.preventDefault();
	else event.returnValue = false;

	currentContent.set({
		title: currentContent.title.trim(),
		text: currentContent.text.trim()
	});

	currentContent[currentContent.type.toLowerCase()] = currentContent.text;

	//var titleDiff = (currentContent.title !== currentContent._title);
	//var textDiff = (currentContent.text !==
	// currentContent[currentContent.type.toLowerCase()]);

	//if ( textDiff || titleDiff ) {
	self.innerHTML = "...saving...";
	var data = {
		'__metadata': {
			'type': currentContent.listItemType
		},
		'Title': currentContent.title,
		'Overview': currentContent.overview,
		'Policy': currentContent.policy,
		'Training': currentContent.training,
		'Resources': currentContent.resources,
		'Tools': currentContent.tools,
		'Contributions': currentContent.contributions
	};
	//if ( titleDiff ) data["Title"] = currentContent.title;
	//if ( textDiff ) data[currentContent.type] = currentContent.text;
	reqwest({
		url: sitePath + "/items(" + currentContent.id + ")",
		method: "POST",
		data: JSON.stringify(data),
		type: "json",
		contentType: "application/json",
		withCredentials: true,
		headers: {
			"X-HTTP-Method": "MERGE",
			"Accept": "application/json;odata=verbose",
			"text-Type": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose",
			"X-RequestDigest": digest,
			"IF-MATCH": "*"
		},
		success: function () {
			self.style.fontWeight = "bold";
			self.innerHTML = "Saved!";
			getList();
		},
		error: function () {
			self.style.color = "#FF2222";
			self.style.fontWeight = "bold";
			self.innerHTML = "Failed!";
		},
		complete: function () {
			if ( !inTransition.tempSaveText ) {
				inTransition.tempSaveText = setTimeout(function () {
					self.removeAttribute("style");
					self.innerHTML = "Save";
				}, 1500);
			}
		}
	});
	/*}
	 else {
	 if ( !misc.regNoChange.test(self.className) ) {
	 self.className += " nochange";
	 }
	 self.innerHTML = "No change";
	 if ( inTransition.tempSaveText ) {
	 clearTimeout(inTransition.tempSaveText);
	 }
	 inTransition.tempSaveText = setTimeout(function () {
	 self.className = self.className.replace(misc.regNoChange, "");
	 self.innerHTML = "Save";
	 }, 1500);
	 }*/
	return false;
}

function createPage ( event ) {
	event = event || window.event;
	if ( event.preventDefault ) event.preventDefault();
	else event.returnValue = false;
	var location = window.location.hash.slice(1);

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
		if ( title === "" ) {
			sweetAlert.showInputError("Please enter a page title!");
			return false;
		}
		var firstTry = title.replace(/[^a-zA-Z0-9_-]/g, "");
		sweetAlert({
			title: "Perfect!",
			text: "What a great name.  Can you shorten it at all to make the URL easier to manage?  If not, just hit continue!",
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
			if ( newName === "" ) {
				sweetAlert.showInputError("Are you trying to cancel or do you just want me to use what we already have so far?");
				return false;
			}

			var name = newName.replace(/[^a-zA-Z0-9_-]/g, ""),
				path = "",
				section = "",
				program = "",
				page = "",
				rabbitHole = "";

			if ( currentContent.section !== "" ) {
				// Has to be a new Program or lower
				section = currentContent.section
				path += "/" + currentContent.section;
				if ( currentContent.program !== "" ) {
					// Has to be a new Page or lower
					program = currentContent.program;
					path += "/" + currentContent.program;
					if ( currentContent.page !== "" ) {
						// Has to be a new rabbitHole/SubPage
						page = currentContent.page;
						rabbitHole = name;
						path += "/" + currentContent.page + "/" + name;
					}
					else {
						page = name;
						path += "/" + name;
					}
				}
				else {
					program = name;
					path += "/" + name;
				}
			}
			else {
				// Has to be a new Section
				section = name;
				path += "/" + name;
			}

			sweetAlert({
				title: "Confirm",
				text: misc.md.render("Your page will have the title:\n\n**`" + title + "`**\n\nPage location: **`" + path + "`**\n"),
				closeOnConfirm: false,
				showCancelButton: true,
				showLoaderOnConfirm: true,
				html: true,
				type: "warning"
			}, function () {
				reqwest({
					url: sitePath + "/items",
					method: "POST",
					data: JSON.stringify({
						'__metadata': {
							'type': currentContent.listItemType
						},
						'Title': title,
						'Overview': '### New Page :)\n#### Joy',
						'Section': section,
						'Program': program,
						'Page': page,
						'rabbitHole': rabbitHole
					}),
					type: "json",
					contentType: "application/json",
					withCredentials: true,
					headers: {
						"Accept": "application/json;odata=verbose",
						"text-Type": "application/json;odata=verbose",
						"Content-Type": "application/json;odata=verbose",
						"X-RequestDigest": digest
					},
					success: function () {
						sweetAlert({
							title: "Success!",
							text: title + " was created at " + path,
							type: "success",
							showCancelButton: true,
							cancelButtonText: "Stay here",
							confirmButtonText: "Visit new page"
						}, function () {
							router.setRoute(path);
						});
					},
					error: misc.connError
				});
			});
		});
	});
}

function updateTitle () {
	var val = this.value.trim();
	domRefs.title.innerHTML = val;
	currentContent.set({
		title: val
	});
}

function editPage () {
	if ( misc.regFullPage.test(domRefs.content.className) ) {
		domRefs.content.className = domRefs.content.className.replace(misc.regFullPage, "");
		//domRefs.editor.refresh();
	}
	else {
		domRefs.content.className += " fullPage";
	}
	domRefs.editor.refresh();
	return false;
}

function toggleCheatSheet () {
	if ( domRefs.cheatSheet.style.display === "none" ) {
		domRefs.cheatSheet.removeAttribute("style");
	}
	else {
		domRefs.cheatSheet.style.display = "none";
	}
	return false;
}

function update ( e ) {
	var val = e.getValue();
	insertContent(val, currentContent.type);
	currentContent.set({
		text: val
	});
}

function insertContent ( text, type ) {
	domRefs.output.innerHTML = misc.md.render("## " + type + "\n" + text);
}

function pageSetup () {
	dirtyDOM = ( !codeMirror ) ?
	           render(navDOM, tabsDOM, currentContent.title, renderLoader()) :
	           renderEditor(navDOM, tabsDOM, currentContent.title, currentContent.text, renderLoader());
	rootNode = createElement(dirtyDOM);
	phWrapper.parentNode.replaceChild(rootNode, phWrapper);
	domRefs = new DOMRef();

	try {
		rootNode.querySelector("#ph-nav a[href='" + window.location.hash + "']").className += " active";
		rootNode.querySelector("#ph-tabs a.icon-overview").parentNode.className += " tab-current";
	}
	catch ( e ) {
		console.log(e);
	}
	try {
		var hashArray = window.location.hash.slice(2).split(/\//);
		var i,
			total;

		if ( hashArray.length > 1 ) {
			var phPage = rootNode.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/'], #ph-nav [data-href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
			if ( phPage ) {
				i = 0;
				total = phPage.length;
				for ( ; i < total; ++i ) {
					phPage[i].removeAttribute("style");
					phPage[i].parentNode.removeAttribute("style");
				}
			}
			if ( hashArray.length > 2 ) {
				var phRabbitHoles = rootNode.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/" + hashArray[2] + "/'], #ph-nav [data-href^='#/" + hashArray[0] + "/" + hashArray[1] + "/" + hashArray[2] + "/']");
				if ( phRabbitHoles ) {
					i = 0;
					total = phRabbitHoles.length;
					for ( ; i < total; ++i ) {
						phRabbitHoles[i].removeAttribute("style");
						phRabbitHoles[i].parentNode.removeAttribute("style");
					}
				}
			}
		}
	}
	catch ( e ) {
		console.log(e);
	}

	//startLoading(domRefs.output);

	if ( window.location.hash ) {
		/**
		 * Example:  copy + paste URL to https://kx.afms.mil/kj/kx7/PublicHealth/[...]/#/FH/TravelMedicine
		 */
		router.init();
	}
	else {
		/**
		 * Example:  copy + paste URL to https://kx.afms.mil/kj/kx7/PublicHealth/[...]
		 */
		router.init("/");
	}

}

function setupEditor () {
	console.log("Loading editor...");
	if ( domRefs.editor ) {
		var wrap = domRefs.editor.getWrapperElement();
		wrap.parentNode.removeChild(wrap);
		domRefs.set({
			editor: null
		});
	}
	var refreshDOM = renderEditor(navDOM, tabsDOM, currentContent.title, currentContent.text, renderLoader());
	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	domRefs = new DOMRef();
	domRefs.set({
		editor: codeMirror.fromTextArea(domRefs.textarea, {
			mode: 'gfm',
			lineNumbers: false,
			matchBrackets: true,
			lineWrapping: true,
			theme: "mdn-like",
			extraKeys: { "Enter": "newlineAndIndentContinueMarkdownList" }
		})
	});
	domRefs.editor.on("change", update);
	domRefs.editor.refresh();
	domRefs.buttons.childNodes[0].removeAttribute("style");
	console.log("Editor loaded");
}

function resetPage () {
	console.log("Page reset");
	var oldActive = rootNode.querySelectorAll("a.active"),
		i = 0,
		total = oldActive.length;
	for ( ; i < total; ++i ) {
		oldActive[i].className = oldActive[i].className.replace(/ ?active/gi, "");
	}
	if ( codeMirror ) {
		if ( domRefs.editor ) {
			var wrap = domRefs.editor.getWrapperElement();
			wrap.parentNode.removeChild(wrap);
			domRefs.set({
				editor: null
			});
		}
		var refreshDOM = renderEditor(navDOM, tabsDOM, currentContent.title, currentContent.text, renderLoader());
	}
	else {
		refreshDOM = render(navDOM, tabsDOM, currentContent.title, renderLoader());
	}
	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	domRefs = new DOMRef();
	//startLoading(domRefs.output);
}

getList();
