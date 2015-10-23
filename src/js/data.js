var reqwest = require("reqwest"),
	sweetAlert = require("sweetalert"),
	pages = require("./pages"),
	events = require("./events"),
	DOM = require("./dom"),
	misc = require("./helpers");

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
			if ( DOM.state.nextPath !== "" ) {
				return false;
			}
			pages.init(data);
			if ( misc.codeMirror && pages.options.hideEmptyTabs === true && pages.options.emptyTabsNotify === true ) {
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
	/*if ( misc.inTransition.output ) {
		return false;
	}*/

	misc.inTransition.output = true;
	DOM.output.innerHTML = "<div class='loading'><div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div></div>";

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
			if ( DOM.state.nextPath !== path ) {
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

events.on("content.save", function () {
	DOM.setState({
		saveText: "...saving..."
	}, true, true);
	var current = pages.current,
		pubs = [],
		pub;
	while ( pub = misc.regPubs.exec(current.Policy) ) {
		pubs.push(pub);
	}
	var content = {
		text: current.text.trim(),
		Title: current.Title.trim(),
		Pubs: pubs.join(" "),
		Tags: current.Tags.trim(),
		Modified: new Date()
	};
	content[current.type] = current.text;

	var data = {
		'__metadata': {
			'type': current.listItemType
		},
		'Title': current.Title,
		'Pubs': current.Pubs,
		'Tags': current.Tags,
		'Overview': current.Overview,
		'Policy': current.Policy,
		'Training': current.Training,
		'Resources': current.Resources,
		'Tools': current.Tools,
		'Contributions': current.Contributions
	};
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
				url: sitePath + "/items(" + current.ID + ")",
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
					current.set(content);
					if ( document.title !== current.Title ) {
						document.title = current.Title;
					}
				},
				error: function ( error ) {
					sweetAlert({
						title: "Failure",
						text: misc.md.renderInline(current.Title + " **was not** able to be saved"),
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
					DOM.setState({
						saveText: "Saved!"
					}, true, true);
					misc.inTransition.tempSaveStyle = setTimeout(function () {
						misc.inTransition.tempSaveStyle = null;
						DOM.setState({
							saveText: "Save"
						}, true, true);
					}, 500);
				}
			});
		},
		error: function ( error ) {
			sweetAlert({
				title: "Failure",
				text: misc.md.renderInline(current.Title + " **was not** able to be saved"),
				type: "fail",
				showCancelButton: false,
				html: true
			});
			console.log("Content save error: ", error);
			if ( misc.inTransition.tempSaveStyle ) {
				clearTimeout(misc.inTransition.tempSaveStyle);
			}
			misc.inTransition.tempSaveStyle = setTimeout(function () {
				misc.inTransition.tempSaveStyle = null;
				DOM.setState({
					saveText: "Save"
				}, true, true);
			}, 500);
		}
	});
});

events.on("title.save", function ( title ) {
	if ( misc.inTransition.titleBorder ) {
		clearTimeout(misc.inTransition.titleBorder);
	}
	DOM.setState({
		titleChanging: true
	}, false, true);
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
				url: sitePath + "/items(" + pages.current.ID + ")",
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
						Title: title,
						_title: title
					});
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
						misc.inTransition.titleBorder = null;
						DOM.setState({
							titleChanging: false
						}, false, true);
					}, 350);
					DOM.update(false, true);
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
				misc.inTransition.titleBorder = null;
				DOM.setState({
					titleChanging: false
				}, false, true);
			}, 350);
			DOM.update(false, true);
		}
	});
});

events.on("tags.save", function ( tags ) {
	/*if ( misc.inTransition.titleBorder ) {
		clearTimeout(misc.inTransition.titleBorder);
	}*/
	DOM.setState({
		tagsChanging: true
	}, true, true);
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
				url: sitePath + "/items(" + pages.current.ID + ")",
				method: "POST",
				data: JSON.stringify({
					'__metadata': {
						'type': pages.current.listItemType
					},
					'Tags': tags
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
						Tags: tags
					});
				},
				error: function ( error ) {
					if ( !misc.inTransition.errorDlg ) {
						// So we can lazy save it.
						misc.inTransition.errorDlg = true;
						sweetAlert({
							title: "Failure",
							text: misc.md.renderInline("Tag(s) **not** able to be saved"),
							type: "fail",
							showCancelButton: false,
							html: true
						}, function() {
							misc.inTransition.errorDlg = false;
						});
					}
					console.log("Tags save error: ", error);
					console.log("Tags: ", tags);
				},
				complete: function () {
					DOM.setState({
						tagsChanging: false
					}, true, true);
				}
			});
		},
		error: function ( error ) {
			if ( !misc.inTransition.errorDlg ) {
				// So we can lazy save it.
				misc.inTransition.errorDlg = true;
				sweetAlert({
					title: "Failure",
					text: misc.md.renderInline("Tag(s) **not** able to be saved"),
					type: "fail",
					showCancelButton: false,
					html: true
				}, function () {
					misc.inTransition.errorDlg = false;
				});
			}
			console.log("Tags save error (couldn't get digest): ", error);
			console.log("Tags: ", tags);
			DOM.setState({
				tagsChanging: false
			}, true, true);
		}
	});
});

module.exports = init;
