var h = require("virtual-dom/h"),
	diff = require("virtual-dom/diff"),
	patch = require("virtual-dom/patch"),
	createElement = require("virtual-dom/create-element"),
	reqwest = require("reqwest"),
	Router = require("director/build/director").Router,
	console = console || require("console"),
	sweetAlert = require("sweetalert"),

	misc = require("./helpers"),
	codeMirror = misc.codeMirror,

	data = require("./data"),
	baseURL = data.baseURL,
	sitePath = "",//data.sitePath,
	digest = data.digest,

	pages = require("./store").pages,
	events = require("./store").events,
	current = pages.current,

	DOMRef = require("./domStore").DOMRef,
	domRefs = require("./domStore").domRefs,
	dirtyDOM = null,
	rootNode = null,
	navDOM = null,
	renderNav = require("./nav"),
	renderTabs = require("./tabs"),
	tabsDOM = renderTabs([
		{
			title: "Overview",
			icon: "home"
		}
	], { style: { display: "none" } }, handleTab),
	inTransition = {},
	router = Router({
		'/': {
			on: function () {
				events.emit("page.loading", "/");
			}
		},
		'/(\\w+)': {
			on: function ( section ) {
				events.emit("page.loading", "/" + section.replace(/\s/g, ""));
			},
			'/(\\w+)': {
				on: function ( section, program ) {
					events.emit("page.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, ""));
				},
				'/(\\w+)': {
					on: function ( section, program, page ) {
						events.emit("page.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, ""));
					},
					'/(\\w+)': {
						on: function ( section, program, page, rabbitHole ) {
							events.emit("page.loading", "/" + section.replace(/\s/g, "") + "/" + program.replace(/\s/g, "") + "/" + page.replace(/\s/g, "") + "/" + rabbitHole.replace(/\s/g, ""));
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
	var regLoading = / ?loading/gi;
	var target = domRefs.output;
	if ( inTransition.output === true ) {
		return false;
	}
	inTransition.output = true;
	if ( regLoading.test(target.className) === false ) {
		inTransition.tmp = target.innerHTML;
		target.innerHTML = "<div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div>";
		target.className += " loading";
	}
});

events.on("*.loaded", function () {
	var regLoading = / ?loading/gi;
	var target = domRefs.output;
	inTransition.output = false;
	target.className = target.className.replace(regLoading, "");
});

events.on("list.success", function ( data ) {
	pages.init(data);
	navDOM = renderNav(pages.sections);
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

events.on("page.loaded", function ( data ) {
	console.log("page data: ", data);
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

	var tabsStyle = ( current.program !== "" ) ? null : { style: { display: "none" } };
	tabsDOM = renderTabs([
		{
			title: "Overview",
			icon: "home"
		},
		{
			title: "Policy",
			icon: "notebook"
		},
		{
			title: "Training",
			icon: "display1"
		},
		{
			title: "Resources",
			icon: "cloud-upload"
		},
		{
			title: "Tools",
			icon: "tools"
		},
		{
			title: "Contributions",
			icon: "users"
		}
	], tabsStyle, handleTab);

	resetPage();
	insertContent(current.text, current.type);

	var activeLink = document.querySelector("#ph-nav a[href='" + window.location.hash + "']");
	var currentTab = document.querySelector("#ph-tabs a.icon-overview");
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

function handleTab ( page ) {
	var content = {};
	content[current.type.toLowerCase()] = current.text;
	content.text = current[page.toLowerCase()];
	content.type = page;
	current.set(content);
	insertContent(current.text, current.type);
	if ( codeMirror ) {
		setupEditor();
	}
}

function render ( navDOM, tabsDOM, title ) {
	return (
		h("#ph-wrapper", [
			/*h("div#init-page-loader.animated.fadeIn", [
			 h("div.loading-spinner", [
			 h("div.dot.dotOne"),
			 h("div.dot.dotTwo"),
			 h("div.dot.dotThree")
			 ])
			 ]),*/
			h("#ph-side-nav", [navDOM]),
			h("#ph-content.fullPage", [
				tabsDOM,
				h("h1#ph-title", [String(title || "")]),
				h("#ph-contentWrap", [
					h("#ph-output")
				])
			])
		])
	);
}

function renderEditor ( navDOM, tabsDOM, title, text ) {
	return (
		h("#ph-wrapper", [
			/*h("div#init-page-loader", [
			 h("div.loading-spinner", [
			 h("div.dot.dotOne"),
			 h("div.dot.dotTwo"),
			 h("div.dot.dotThree")
			 ])
			 ]),*/
			h("#ph-side-nav", [navDOM]),
			h("#ph-content.fullPage", [
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
				/*h("label#titleFieldLabel", [
				 "Page title: ",
				 h("input#titleField", {
				 onkeyup: updateTitle,
				 value: String(title || ""),
				 type: "text"
				 })
				 ]),*/

				h("#cheatSheet", { style: { display: "none" } }, ["This will be a cheat-sheet for markdown"]),
				h("#ph-contentWrap", [
					h("#ph-input", [
						h("textarea#ph-textarea", [String(text || "")])
					]),
					h("#ph-output")
				])
			])
		])
	);
}

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

function savePage ( event ) {
	var self = this;
	event = event || window.event;
	if ( event.preventDefault ) event.preventDefault();
	else event.returnValue = false;

	current.set({
		title: current.title.trim(),
		text: current.text.trim()
	});

	current[current.type.toLowerCase()] = current.text;

	//var titleDiff = (current.title !== current._title);
	//var textDiff = (current.text !==
	// current[current.type.toLowerCase()]);

	//if ( textDiff || titleDiff ) {
	self.innerHTML = "...saving...";
	var data = {
		'__metadata': {
			'type': current.listItemType
		},
		'Title': current.title,
		'Overview': current.overview,
		'Policy': current.policy,
		'Training': current.training,
		'Resources': current.resources,
		'Tools': current.tools,
		'Contributions': current.contributions
	};
	//if ( titleDiff ) data["Title"] = current.title;
	//if ( textDiff ) data[current.type] = current.text;
	reqwest({
		url: sitePath + "/items(" + current.id + ")",
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
			events.emit("list.loading");
		},
		error: function () {
			self.style.color = "#FF2222";
			self.style.fontWeight = "bold";
			self.innerHTML = "Connection error - try again.";
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
		var firstTry = title.replace(misc.regNormalize, "");
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

			var name = newName.replace(misc.regNormalize, ""),
				path = "",
				section = "",
				program = "",
				page = "",
				rabbitHole = "";

			if ( current.section !== "" ) {
				// Has to be a new Program or lower
				section = current.section;
				path += "/" + current.section;
				if ( current.program !== "" ) {
					// Has to be a new Page or lower
					program = current.program;
					path += "/" + current.program;
					if ( current.page !== "" ) {
						// Has to be a new rabbitHole/SubPage
						page = current.page;
						rabbitHole = name;
						path += "/" + current.page + "/" + name;
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
							'type': current.listItemType
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
							return false;
						});
					},
					error: function ( error ) {
						console.log("error connecting:", error);
					}
				});
			});
		});
	});
}

/*function updateTitle () {
 var val = this.value.trim();
 domRefs.title.innerHTML = val;
 current.set({
 title: val
 });
 }*/

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
	insertContent(val, current.type);
	current.set({
		text: val
	});
}

function insertContent ( text, type ) {
	domRefs.output.innerHTML = misc.md.render("## " + type + "\n" + text);
}

function pageSetup () {
	dirtyDOM = ( !codeMirror ) ?
		render(navDOM, tabsDOM, current.title) :
		renderEditor(navDOM, tabsDOM, current.title, current.text);
	rootNode = createElement(dirtyDOM);
	phWrapper.parentNode.replaceChild(rootNode, phWrapper);
	domRefs = new DOMRef();

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
		/*if ( hashArray.length > 2 ) {
		 var phRabbitHoles = document.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/" + hashArray[2] + "/'], #ph-nav [data-href^='#/" + hashArray[0] + "/" + hashArray[1] + "/" + hashArray[2] + "/']");
		 if ( phRabbitHoles ) {
		 i = 0;
		 total = phRabbitHoles.length;
		 for ( ; i < total; ++i ) {
		 phRabbitHoles[i].removeAttribute("style");
		 phRabbitHoles[i].parentNode.removeAttribute("style");
		 }
		 }
		 }*/
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
	var refreshDOM = renderEditor(navDOM, tabsDOM, current.title, current.text);

	//domRefs.updateDom(dirtyDOM, refreshDOM);

	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	/*domRefs = new DOMRef();*/

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
	var oldActive = document.querySelectorAll("a.active"),
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
		var refreshDOM = renderEditor(navDOM, tabsDOM, current.title, current.text);
	}
	else {
		refreshDOM = render(navDOM, tabsDOM, current.title);
	}
	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	domRefs = new DOMRef();
}

events.emit("list.loading");
//getList();
