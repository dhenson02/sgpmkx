var	pages = require("./pages"),
	events = require("./events"),
	DOM = require("./dom"),
	reqwest = require("reqwest"),
	sweetAlert = require("sweetalert"),
	misc = require("./helpers"),
	inTransition = misc.inTransition,
	clicked = misc.clicked;

function init () {
	events.emit("page.init");
}

/*events.on("manager.verifying", function () {
	reqwest({
		url: phCMCheckURL,
		method: "GET",
		headers: {
			"accept": "application/json; odata=verbose"
		},
		success: function () {
			console.log("Success!  You are a CM.  Toys will now load.");
			events.emit("page.loading-editor");
		},
		error: function ( err ) {
			console.log("Not a content manager (group 419) or connection error.  See details here: ", err);
		}
	});
});*/

events.on("page.init", function () {
	reqwest({
		url: baseURL + phOptionsURI,
		method: "GET",
		type: "json",
		contentType: "application/json",
		withCredentials: phLive,
		headers: {
			"Accept": "application/json;odata=verbose",
			"text-Type": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose"
		},
		success: function ( data ) {
			var options = {};
			data.d.results.forEach(function ( option ) {
				options[option.Variable] = option.Value;
			});
			pages.set({ options: options });
		},
		error: function ( error ) {
			console.log("Error loading settings, will go with defaults.  Error: ", error);
			console.log("pages.options: ", pages.options);
		},
		complete: function () {
			events.emit("page.loading");
		}
	});
});

events.on("page.loading", function () {
	var timestamp = (Date && Date.now() || new Date());
	clicked = parseInt(timestamp, 10);
	reqwest({
		url: sitePath + "/items/?$select=ID,Title,Icon,Section,Program,Page,rabbitHole,Keywords,References,Link,Created,Modified",
		method: "GET",
		type: "json",
		contentType: "application/json",
		withCredentials: phLive,
		headers: {
			"Accept": "application/json;odata=verbose",
			"text-Type": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose"
		},
		success: function ( data ) {
			if ( clicked !== parseInt(timestamp, 10) ) {
				return false;
			}
			pages.init(data);
			events.emit("page.loaded");
			events.emit("page.success");
			if ( pages.options.hideEmptyTabs === true && pages.options.emptyTabsNotify === true && misc.codeMirror ) {
				sweetAlert({
					title: "Tabs missing?",
					text: misc.md.render("Only tabs with content in them are visible.  To view all tabs, simply click `Show editor`.\n\n Adjust this behavior through the [Options list](/kj/kx7/PublicHealth/Lists/Options)"),
					type: "info",
					html: true,
					showCancelButton: false,
					confirmButtonText: "Got it!"
				});
			}
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});
});

events.on("content.loading", function ( path ) {
	if ( !pages[path] ) {
		events.emit("missing", path);
		return false;
	}
	if ( inTransition.output ) {
		return false;
	}
	//inTransition.output = DOM.output.innerHTML;
	inTransition.output = true;
	DOM.output.innerHTML = "<div class='loading'><div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div></div>";

	var timestamp = (Date && Date.now() || new Date());
	clicked = parseInt(timestamp, 10);
	reqwest({
		url: sitePath + "/items(" + pages[path].ID + ")",
		method: "GET",
		type: "json",
		contentType: "application/json",
		withCredentials: phLive,
		headers: {
			"Accept": "application/json;odata=verbose",
			"text-Type": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose"
		},
		success: function ( data ) {
			if ( clicked !== parseInt(timestamp, 10) ) {
				// Prevent accidental load of previously clicked destination
				return false;
			}
			events.emit("content.loaded", data);
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});
});

events.on("content.create", function ( data, path, title ) {
	reqwest({
		url: baseURL + phContext + "/_api/contextinfo",
		method: "POST",
		withCredentials: phLive,
		headers: {
			"Accept": "application/json;odata=verbose",
			"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
		},
		success: function ( ctx ) {
			reqwest({
				url: sitePath + "/items",
				method: "POST",
				data: JSON.stringify(data),
				type: "json",
				contentType: "application/json",
				withCredentials: phLive,
				headers: {
					"Accept": "application/json;odata=verbose",
					"text-Type": "application/json;odata=verbose",
					"Content-Type": "application/json;odata=verbose",
					"X-RequestDigest": ctx.d.GetContextWebInformation.FormDigestValue
				},
				success: function () {
					sweetAlert({
						title: "Success!",
						text: misc.md.render(title + " was created at [" + path + "](#" + path + ")"),
						type: "success",
						showConfirmButton: false,
						showCancelButton: false,
						html: true
					});
				},
				error: function ( error ) {
					sweetAlert({
						title: "Failure",
						text: misc.md.render(title + " **was not** created at *" + path + "*"),
						type: "fail",
						showCancelButton: false,
						html: true
					});
					console.log(error);
				}
			});
		},
		error: function ( error ) {
			sweetAlert({
				title: "Failure",
				text: misc.md.render(title + " **was not** created at *" + path + "*"),
				type: "fail",
				showCancelButton: false,
				html: true
			});
			console.log("Error getting new digest: ", error);
		}
	});
});

events.on("title.saving", function ( title, el ) {
	if ( inTransition.titleBorder ) {
		clearTimeout(inTransition.titleBorder);
	}
	reqwest({
		url: baseURL + phContext + "/_api/contextinfo",
		method: "POST",
		withCredentials: phLive,
		headers: {
			"Accept": "application/json;odata=verbose",
			"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
		},
		success: function ( ctx ) {
			reqwest({
				url: sitePath + "/items(" + pages.current.id + ")",
				method: "POST",
				data: JSON.stringify({
					'__metadata': {
						'type': pages.current.listItemType
					},
					'Title': title
				}),
				type: "json",
				withCredentials: phLive,
				headers: {
					"X-HTTP-Method": "MERGE",
					"Accept": "application/json;odata=verbose",
					"text-Type": "application/json;odata=verbose",
					"Content-Type": "application/json;odata=verbose",
					"X-RequestDigest": ctx.d.GetContextWebInformation.FormDigestValue,
					"IF-MATCH": "*"
				},
				success: function () {
					pages.current.set({
						_title: title
					});
					document.title = title;
					el.className = el.className.replace(/ ?loading/gi, "");
					DOM.rootNode.querySelector("#ph-link-" + pages.current.id + " .link-title").innerHTML = title;
					el.style.borderBottomColor = "#00B16A";
				},
				error: function ( error ) {
					el.className = el.className.replace(/ ?loading/gi, "");
					el.style.border = "2px dashed #FF2222";
					el.style.fontWeight = "bold";
					console.log("Error saving title: ", error);
				},
				complete: function () {
					inTransition.title = false;
					inTransition.titleBorder = setTimeout(function () {
						el.removeAttribute("style");
						el.contentEditable = true;
						inTransition.titleBorder = null;
					}, 1000);
				}
			});
		},
		error: function ( error ) {
			el.className = el.className.replace(/ ?loading/gi, "");
			el.style.border = "2px dashed #FF2222";
			el.style.fontWeight = "bold";
			console.log("Error getting new digest: ", error);
			inTransition.title = false;
			inTransition.titleBorder = setTimeout(function () {
				el.removeAttribute("style");
				el.contentEditable = true;
			}, 1000);
		}
	});
});

events.on("content.save", function ( data, btnText ) {
	btnText.removeAttribute("style");
	btnText.innerHTML = "...saving...";
	if ( inTransition.tempSaveText ) {
		clearTimeout(inTransition.tempSaveText);
	}
	reqwest({
		url: baseURL + phContext + "/_api/contextinfo",
		method: "POST",
		withCredentials: phLive,
		headers: {
			"Accept": "application/json;odata=verbose",
			"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
		},
		success: function ( ctx ) {
			reqwest({
				url: sitePath + "/items(" + pages.current.id + ")",
				method: "POST",
				data: JSON.stringify(data),
				type: "json",
				withCredentials: phLive,
				headers: {
					"X-HTTP-Method": "MERGE",
					"Accept": "application/json;odata=verbose",
					"text-Type": "application/json;odata=verbose",
					"Content-Type": "application/json;odata=verbose",
					"X-RequestDigest": ctx.d.GetContextWebInformation.FormDigestValue,
					"IF-MATCH": "*"
				},
				success: function () {
					btnText.parentNode.className = btnText.parentNode.className.replace(/ ?loading/gi, "");
					btnText.style.fontWeight = "bold";
					btnText.innerHTML = "Saved!";
				},
				error: function ( error ) {
					btnText.parentNode.className = btnText.parentNode.className.replace(/ ?loading/gi, "");
					btnText.style.color = "#FF2222";
					btnText.style.fontWeight = "bold";
					btnText.innerHTML = "Connection error (press F12 for Console)";
					console.log("Couldn't save due to error: ", error.response);
				},
				complete: function () {
					inTransition.tempSaveText = setTimeout(function () {
						btnText.removeAttribute("style");
						btnText.innerHTML = "Save";
						inTransition.tempSaveText = null;
					}, 1000);
				}
			});
		},
		error: function ( error ) {
			btnText.parentNode.className = btnText.parentNode.className.replace(/ ?loading/gi, "");
			btnText.style.color = "#FF2222";
			btnText.style.fontWeight = "bold";
			btnText.innerHTML = "Digest error (press F12 for Console)";
			console.log("Error getting new digest: ", error);
			inTransition.tempSaveText = setTimeout(function () {
				btnText.removeAttribute("style");
				btnText.innerHTML = "Save";
				inTransition.tempSaveText = null;
			}, 1000);
		}
	});
});

module.exports = init;
