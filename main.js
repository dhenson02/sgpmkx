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

/*
function renderLoader () {
	return (
		h(".loader-group", [
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
*/

function render ( navDOM, tabsDOM, title ) {
	return (
		h("#wrapper", [
			h("#sideNav", [navDOM]),
			h("#content.fullPage", [
				tabsDOM,
				h("h1#ph-title", [String(title || "")]),
				h("#contentWrap", [
					h("#output")
				])
			])
		])
	);
}

function renderEditor ( navDOM, tabsDOM, title, text ) {
	return (
		h("#wrapper", [
			h("#sideNav", [navDOM]),
			h("#content.fullPage", [
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
				h("#buttons", [
					h("button#toggleButton.btn", {
						onclick: toggleEditor,
						style: { display: "none" }
					}, ["Toggle Editor"]),
					h("div.clearfix"),
					h("button#cheatSheetButton.btn", {
						onclick: toggleCheatSheet,
						type: "button"
					}, ["Cheat Sheet"]),
					h("button#saveButton.btn", {
						onclick: savePage,
						type: "button"
					}, ["Save"]),
					h("button#createButton.btn", {
						onclick: createPage,
						type: "button"
					}, ["New"])
				]),
				h("#cheatSheet", { style: { display: "none" } }, ["This will be a cheat-sheet for markdown"]),
				h("#contentWrap", [
					h("#input", [
						h("textarea#textarea", [String(text || "")])
					]),
					h("#output")
				])
			])
		])
	);
}

function startLoading ( target ) {
	if ( inTransition[target.id] === true ) {
		return false;
	}
	inTransition[target.id] = true;
	if ( misc.regLoading.test(target.className) === false ) {
		inTransition["tmp"] = target.innerHTML;
		target.innerHTML = "<div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div>";
		target.className += " loading";
	}
}

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
	//var textDiff = (currentContent.text !== currentContent[currentContent.type.toLowerCase()]);

	//if ( textDiff || titleDiff ) {
	self.innerHTML = "...saving...";
	var data = {
		'__metadata': {
			'type': currentContent.listItemType
		},
		'Title': currentContent.title,
		'Overview': currentContent.overview,
		'Resources': currentContent.resources,
		'Tools': currentContent.tools,
		'Policy': currentContent.policy,
		'Training': currentContent.training,
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
		var name = title.toCamelCase();
		var section = currentContent.section || name;
		var program = currentContent.program || ((currentContent.section) ? name : "Home");
		var page = (currentContent.program) ? name : "Home";

		var path = ( location === "/" ) ? "/" + name : location + "/" + name;
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
					'Path': path
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
						showCancelButton: false,
						showConfirmButton: false,
						timer: 2000
					}, function () {
						router.setRoute(path);
					});
				},
				error: misc.connError
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

function toggleEditor () {
	if ( misc.regFullPage.test(domRefs.content.className) ) {
		domRefs.content.className = domRefs.content.className.replace(misc.regFullPage, "");
		domRefs.editor.refresh();
	}
	else {
		domRefs.content.className += " fullPage";
	}
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

function pageSetup ( title ) {
	dirtyDOM = ( !codeMirror ) ?
	           render(navDOM, tabsDOM, currentContent.title || title) :
	           renderEditor(navDOM, tabsDOM, currentContent.title || title, currentContent.text);
	rootNode = createElement(dirtyDOM);

	try {
		var wrapperTmp = document.getElementById("wrapper");
		wrapperTmp.parentNode.replaceChild(rootNode, wrapperTmp);
	}
	catch ( e ) {
		try {
			wrapperTmp = document.getElementById("content");
			wrapperTmp.style.display = "none";
			wrapperTmp.parentNode.appendChild(rootNode);
		}
		catch ( e ) {
			document.body.appendChild(rootNode);
		}
	}

	domRefs = new DOMRef();
	if ( window.location.hash ) {
		router.init();
	}
	else {
		router.init("/");
	}

	try {
		rootNode.querySelector("#ph-nav a[href='" + window.location.hash + "']").className += " active";
	}
	catch ( e ) {
		console.log(e);
	}
	try {
		var hashArray = window.location.hash.slice(2).split(/\//);
		if ( hashArray.length > 1 ) {
			var subCat = rootNode.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
			if ( subCat ) {
				var i = 0, total = subCat.length;
				for ( ; i < total; ++i ) {
					subCat[i].parentNode.removeAttribute("style");
				}
			}
		}
	}
	catch ( e ) {
		console.log(e);
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
	var refreshDOM = renderEditor(navDOM, tabsDOM, currentContent.title, currentContent.text);
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
	var oldActive = rootNode.querySelectorAll("a.active"),
		i = 0,
		total = oldActive.length;
	for ( ; i < total; ++i ) {
		oldActive[i].className = oldActive[i].className.replace(/ ?active/gi, "");
	}
	console.log("PAGE RESET");
	if ( codeMirror ) {
		if ( domRefs.editor ) {
			var wrap = domRefs.editor.getWrapperElement();
			wrap.parentNode.removeChild(wrap);
			domRefs.set({
				editor: null
			});
		}
		var refreshDOM = renderEditor(navDOM, tabsDOM, currentContent.title, currentContent.text);
	}
	else {
		refreshDOM = render(navDOM, tabsDOM, currentContent.title);
	}
	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	domRefs = new DOMRef();
}

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
				page;
			for ( ; i < count; ++i ) {
				results[i].Section = (results[i].Section && results[i].Section.toCamelCase())||"";
				results[i].Program = (results[i].Program && results[i].Program.toCamelCase())||"";
				results[i].Page = (results[i].Page && results[i].Page.toCamelCase())||"";
				results[i].rabbitHole = (results[i].rabbitHole && results[i].rabbitHole.toCamelCase())||"";

				results[i].Path = "/" + ( results[i].Section !== "" ) ?
					(results[i].Section + "/" + ( results[i].Program !== "" ) ?
						(results[i].Program + "/" + ( results[i].Page !== "" ) ?
							(results[i].Page + "/" + ( results[i].rabbitHole !== "" ) ?
								results[i].rabbitHole : "") : "") : "") : "";
				pages[results[i].Path] = results[i];
				urls[i] = results[i].Path;
				if ( results[i].Section && !results[i].Program ) {
					sections[results[i].Section] = {
						path: ( !results[i].Link ) ? "#/" + results[i].Section : results[i].Link.Url,
						title: results[i].Title,
						links: []
					};
				}
			}
			var sortedUrls = urls.sort();
			i = 0;
			for ( ; i < count; ++i ) {
				page = pages[sortedUrls[i]];
				var isPage = ( page.Page === "" );
				var isRabbitHole = ( page.rabbitHole === "" );
				var li = "li" + ( isPage ? "" : ".sub-cat" ) + ( isRabbitHole ? "" : ".rabbit-hole");

				if ( page.Program !== "" ) {
					sections[page.Section].links.push({
						path: ( !page.Link ) ? "#" + page.Path : page.Link.Url,
						title: page.Title,
						li: li,
						attr: isPage ? null : { style: { display: "none" } },
						hr: isPage ? h("hr") : null
					});
				}
			}
			navDOM = renderNav(sections);
			pageSetup();
		},
		error: misc.connError
	});
}

function init ( path ) {
	console.log("Begin init...");
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
				window.location.href = obj.Link.Url;
			}
			var subLinks = rootNode.querySelectorAll("#ph-nav .sub-cat");
			i = 0;
			total = subLinks.length;
			for ( ; i < total; ++i ) {
				subLinks[i].style.display = "none";
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
				//path: obj.Path.split("/"),
				//link: (obj.Link && obj.Link.Url) || "",
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
				"Contribution"
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
			}
			catch ( e ) {
				console.log(e);
			}

			var hashArray = window.location.hash.slice(2).split(/\//);
			var programPages = rootNode.querySelectorAll("#ph-nav a[href^='#/" + hashArray[0] + "/" + hashArray[1] + "/']");
			if ( programPages ) {
				var i = 0;
				var total = programPages.length;
				for ( ; i < total; ++i ) {
					programPages[i].parentNode.removeAttribute("style");
				}
			}
			document.title = currentContent.title;
		},
		error: misc.connError,
		complete: function () {
			if ( codeMirror ) {
				setupEditor();
			}
		}
	});
}

router = Router({
	'/': {
		on: function () {
			startLoading(domRefs.output);
			init("/");
		}
	},
	'/(\\w+)': {
		on: function ( section ) {
			startLoading(domRefs.output);
			init("/" + section);
		},
		'/(\\w+)': {
			on: function ( section, program ) {
				startLoading(domRefs.output);
				init("/" + section + "/" + program);
			},
			'/(\\w+)': {
				on: function ( section, program, page ) {
					startLoading(domRefs.output);
					init("/" + section + "/" + program + "/" + page);
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
			text: "Page doesn't exist.  Sorry :(\n\nLet\'s go back!",
			timer: 2000,
			showConfirmButton: false,
			allowOutsideClick: true
		}, function () {
			router.setRoute("/");
		});
	}
});

getList();
