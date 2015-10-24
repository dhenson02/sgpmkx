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

events.on("content.loading", function ( path, level, parent ) {
	if ( !pages[path] ) {
		events.emit("missing", path);
		return false;
	}
	if ( DOM.state.contentSaving || DOM.state.contentChanging || DOM.state.path === path || DOM.state.nextPath === path ) {
		return false;
	}
	DOM.setState({
		nextPath: path,
		nextLevel: level,
		nextParent: parent,
		contentChanging: true
	});
	//DOM.output.innerHTML = "<div id='ph-loader' class='ph-loader loading'><div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div></div>";

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
		// Prevent accidental load of previously clicked destination
			if ( DOM.state.nextPath !== path ) {
				return false;
			}
			events.emit("content.loaded", data);
		},
		error: function ( error ) {
			DOM.setState({
				nextPath: "",
				nextLevel: null,
				nextParent: "",
				contentChanging: false
			});
			console.log("error connecting:", error);
		}
	});
});

/*
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
*/

events.on("content.save", function () {
	if ( DOM.state.contentSaving || DOM.state.contentChanging ) {
		return false;
	}
	DOM.setState({
		saveText: "...saving...",
		saveStyle: {
			color: "#00B16A",
			backgroundColor: "#FFFFFF"
		},
		contentSaving: true
	}, true, true, false, false);

	var pubs = "", pub;
	while ( pub = misc.regPubs.exec(pages.current.Policy) ) {
		pubs = ( pubs ) ?
		pubs + "," + pub :
			pub;
	}

	pages.current.set({
		Pubs: pubs,
		Modified: new Date()
	});
	var data = {
		'__metadata': {
			'type': pages.current.listItemType
		},
		//'Title': pages.current.Title, // Is saved on its own
		'Pubs': pages.current.Pubs,
		//'Tags': pages.current.Tags,   // No need to waste bandwidth or arrive at a conflict somehow
		'Overview': pages.current.Overview,
		'Policy': pages.current.Policy,
		'Training': pages.current.Training,
		'Resources': pages.current.Resources,
		'Tools': pages.current.Tools,
		'Contributions': pages.current.Contributions
	};
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
					DOM.setState({
						saveText: "Saved!",
						saveStyle: {
							backgroundColor: "#00B16A",
							color: "#FFFFFF"
						},
						contentSaving: false
					}, true, true, false, false);
				},
				error: function ( error ) {
					sweetAlert({
						title: "Failure",
						text: misc.md.renderInline(pages.current.Title + " **was not** able to be saved"),
						type: "fail",
						showCancelButton: false,
						html: true
					});
					DOM.setState({
						saveText: "Failed :(",
						saveStyle: {
							backgroundColor: "#ec6c62",
							color: "#FFFFFF"
						},
						contentSaving: false
					}, true, true, false, false);
					console.log("Content save error: ", error);
				},
				complete: function () {
					setTimeout(function () {
						DOM.setState({
							saveText: "Save",
							saveStyle: {
								color: "#FFFFFF",
								backgroundColor: "#00B16A"
							}
						}, true, true, false, false);
					}, 500);
				}
			});
		},
		error: function ( error ) {
			sweetAlert({
				title: "Failure",
				text: misc.md.renderInline(pages.current.Title + " **was not** able to be saved"),
				type: "fail",
				showCancelButton: false,
				html: true
			});
			DOM.setState({
				saveText: "Failed :(",
				saveStyle: {
					backgroundColor: "#ec6c62",
					color: "#FFFFFF"
				},
				contentSaving: false
			}, true, true, false, false);
			console.log("Content save error (couldn't get digest): ", error);
			setTimeout(function () {
				DOM.setState({
					saveText: "Save",
					saveStyle: {
						color: "#FFFFFF",
						backgroundColor: "#00B16A"
					}
				}, true, true, false, false);
			}, 500);
		}
	});
});

events.on("title.save", function ( title ) {
	title = title.replace(misc.regSanitize, "");
	if ( title === pages.current._title || DOM.state.titleChanging || !pages.options.saveTitleAfterEdit ) {
		return false;
	}
	DOM.setState({
		titleChanging: true,
		titleStyle: {
			borderBottomColor: "#FF9000",
			color: "#FF9000"
		}
	}, true, true, true, false);
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
					DOM.setState({
						titleStyle: {
							borderBottomColor: "#00B16A",
							color: "#00B16A"
						}
					}, false, true, true, false);
				},
				error: function ( error ) {
					sweetAlert({
						title: "Failure",
						text: misc.md.renderInline(title + " **was not** able to be saved"),
						type: "fail",
						showCancelButton: false,
						html: true
					});
					DOM.setState({
						titleStyle: {
							borderBottomColor: "#EC6C62",
							color: "#EC6C62"
						}
					}, true, true, true, false);
					console.log("Title save error: ", error);
				},
				complete: function () {
					setTimeout(function () {
						DOM.setState({
							titleChanging: false,
							titleStyle: {}
						}, true, true, true, false);
					}, 500);
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
			DOM.setState({
				titleStyle: {
					borderBottomColor: "#EC6C62",
					color: "#EC6C62"
				}
			}, true, true, true, false);
			setTimeout(function () {
				DOM.setState({
					titleChanging: false,
					titleStyle: {}
				}, true, true, true, false);
			}, 500);
		}
	});
});

events.on("tags.save", function ( tags ) {
	DOM.setState({
		tagsChanging: true
	}, true, true, false, true);
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
					sweetAlert({
						title: "Failure",
						text: misc.md.renderInline("Tag(s) **not** able to be saved"),
						type: "fail",
						showCancelButton: false,
						html: true
					});
					console.log("Tags save error: ", error);
					console.log("Tags: ", tags);
				},
				complete: function () {
					DOM.setState({
						tagsChanging: false
					}, true, true, false, true);
				}
			});
		},
		error: function ( error ) {
			sweetAlert({
				title: "Failure",
				text: misc.md.renderInline("Tag(s) **not** able to be saved"),
				type: "fail",
				showCancelButton: false,
				html: true
			});
			console.log("Tags save error (couldn't get digest): ", error);
			console.log("Tags: ", tags);
			DOM.setState({
				tagsChanging: false
			}, true, true, false, true);
		}
	});
});

module.exports = init;
