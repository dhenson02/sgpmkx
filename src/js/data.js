var reqwest = require("reqwest"),
	sweetAlert = require("sweetalert"),
	pages = require("./pages"),
	events = require("./events"),
	DOM = require("./dom"),
	misc = require("./helpers"),
	clicked = misc.clicked;

function init () {
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
			pages.setOption(data.d.results.reduce(function ( obj, option ) {
				obj[option.Variable] = option.Value;
				return obj;
			}, {}));
		},
		error: function ( error ) {
			console.log("Error loading settings, will go with defaults.  Error: ", error);
			console.log("pages.options: ", pages.options);
		},
		complete: function () {
			events.emit("page.loading");
		}
	});
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

events.on("page.loading", function () {
	var timestamp = (Date && Date.now() || new Date());
	clicked = parseInt(timestamp, 10);

	reqwest({
		url: sitePath + "/items/?$select=ID,Title,Icon,Section,Program,Page,rabbitHole,Policy,Tags,Link,Created,Modified,Published",
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
			if ( pages.options.hideEmptyTabs === true && pages.options.emptyTabsNotify === true && misc.codeMirror ) {
				sweetAlert({
					title: "Tabs missing?",
					text: misc.md.renderInline("Only tabs with content in them are visible.  To view all tabs, simply click `Show editor`.\n\n Adjust this behavior through the [Options list](/kj/kx7/PublicHealth/Lists/Options)"),
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
	if ( misc.inTransition.output ) {
		return false;
	}

	misc.inTransition.output = true;
	DOM.update();
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
			events.emit("content.loaded", data, path);
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
						text: misc.md.renderInline(title + " was created at [" + path + "](#" + path + ")"),
						type: "success",
						showConfirmButton: false,
						showCancelButton: false,
						html: true
					});
				},
				error: function ( error ) {
					sweetAlert({
						title: "Failure",
						text: misc.md.renderInline(title + " **was not** created at *" + path + "*"),
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
				text: misc.md.renderInline(title + " **was not** created at *" + path + "*"),
				type: "fail",
				showCancelButton: false,
				html: true
			});
			console.log("Error getting new digest: ", error);
		}
	});
});

events.on("title.saving", function ( title ) {
	if ( misc.inTransition.titleBorder ) {
		clearTimeout(misc.inTransition.titleBorder);
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
					pages[pages.current.path].Title = title;
					document.title = title;
				},
				error: function ( error ) {
					sweetAlert({
						title: "Failure",
						text: misc.md.renderInline(title + " **was not** able to be saved"),
						type: "fail",
						showCancelButton: false,
						html: true
					});
					console.log("Title save error: ", error);
				},
				complete: function () {
					if ( misc.inTransition.titleBorder ) {
						clearTimeout(misc.inTransition.titleBorder);
					}
					misc.inTransition.titleBorder = setTimeout(function () {
						pages.navPrep();
						misc.inTransition.title = false;
						misc.inTransition.titleBorder = null;
						DOM.update();
					}, 350);
					DOM.update();
				}
			});
		},
		error: function ( error ) {
			sweetAlert({
				title: "Failure",
				text: misc.md.renderInline(title + " **was not** able to be saved"),
				type: "fail",
				showCancelButton: false,
				html: true
			});
			console.log("Title save error (couldn't get digest): ", error);
			if ( misc.inTransition.titleBorder ) {
				clearTimeout(misc.inTransition.titleBorder);
			}
			misc.inTransition.titleBorder = setTimeout(function () {
				misc.inTransition.title = false;
				misc.inTransition.titleBorder = null;
				DOM.update();
			}, 350);
			DOM.update();
		}
	});
});

events.on("content.save", function ( data ) {
	if ( misc.inTransition.tempSaveStyle ) {
		clearTimeout(misc.inTransition.tempSaveStyle);
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
					misc.inTransition.tempSaveText = "Saved!";
				},
				error: function ( error ) {
					sweetAlert({
						title: "Failure",
						text: misc.md.renderInline(pages.current.title + " **was not** able to be saved"),
						type: "fail",
						showCancelButton: false,
						html: true
					});
					console.log("Content save error: ", error);
				},
				complete: function () {
					if ( misc.inTransition.tempSaveStyle ) {
						clearTimeout(misc.inTransition.tempSaveStyle);
					}
					misc.inTransition.tempSaveStyle = setTimeout(function () {
						misc.inTransition.tempSaveText = null;
						misc.inTransition.tempSaveStyle = null;
						DOM.update();
					}, 500);
					DOM.update();
				}
			});
		},
		error: function ( error ) {
			sweetAlert({
				title: "Failure",
				text: misc.md.renderInline(pages.current.title + " **was not** able to be saved"),
				type: "fail",
				showCancelButton: false,
				html: true
			});
			console.log("Content save error: ", error);
			if ( misc.inTransition.tempSaveStyle ) {
				clearTimeout(misc.inTransition.tempSaveStyle);
			}
			misc.inTransition.tempSaveStyle = setTimeout(function () {
				misc.inTransition.tempSaveText = null;
				misc.inTransition.tempSaveStyle = null;
				DOM.update();
			}, 500);
			DOM.update();
		}
	});
});

module.exports = init;
