'use strict';

var	sweetAlert = require("sweetalert");
var reqwest = require('reqwest');
var DB = require("./db");
var db = new DB();

var	pages = require("./pages"),
	events = require("./events"),
	DOM = require("./dom"),
	misc = require("./helpers");

var useNetwork = false;
// var useNetwork = true;

function setOption ( data ) {
	pages.setOption(data.d.results.reduce(function ( obj, option ) {
		obj[option.Variable] = option.Value;
		return obj;
	}, {}));
}

function loadPage ( data ) {
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
}

async function init () {
	if ( !useNetwork ) {
		await db.loadData();
		setOption(db.getData('/opt'));
		return events.emit("page.loading");
	}

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
			setOption(data);
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

function handlePageLoading () {
	loadPage(db.getData('/items'));
}

function handlePageLoadingNetwork () {
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
			loadPage(data);
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});
}

events.on("page.loading", useNetwork ? handlePageLoadingNetwork : handlePageLoading);


function loadContent ( data, path ) {
	// Prevent accidental load of previously clicked destination
	if ( DOM.state.nextPath !== path ) {
		return false;
	}
	events.emit("content.loaded", data);
}

function verifyCorrectPage ( path ) {
	if ( !pages[path] ) {
		events.emit("missing", path);
		return false;
	}
	if ( DOM.state.contentSaving || DOM.state.contentChanging || DOM.state.path === path || DOM.state.nextPath === path ) {
		return false;
	}
	return true;
}

function getNewPath ( path, level, parent ) {
	if ( verifyCorrectPage(path) ) {
		DOM.setState({
			nextPath: path,
			nextLevel: level,
			nextParent: parent,
			contentChanging: true
		});

		return "/items(" + pages[path].ID + ")";
	}

	return '';
}

function handleContentLoading ( path, level, parent ) {
	var itemPath = getNewPath(path, level, parent);

	if ( !itemPath ) {
		return false;
	}

	return loadContent(db.getData(itemPath), path);
}

function handleContentLoadingNetwork ( path, level, parent ) {
	var itemPath = getNewPath(path, level, parent);

	if ( !itemPath ) {
		return false;
	}

	reqwest({
		url: sitePath + itemPath,
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
			loadContent(data, path);
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
}

events.on("content.loading", useNetwork ? handleContentLoadingNetwork : handleContentLoading);

function handleCreate ( data, path, title ) {
	// Used for authentication - not needed with no live network data
	// var ctx = db.getData(phContext + "/_api/contextinfo");

	db.saveItem(data);
	// .getData('/items');  // only needed if we want to return the new list

	sweetAlert({
		title: "Success!",
		text: misc.md.renderInline(title + " was created at [" + path + "](#" + path + ")"),
		type: "success",
		showConfirmButton: false,
		showCancelButton: false,
		html: true
	});
}

function handleCreateNetwork ( data, path, title ) {
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
}

events.on("content.create", useNetwork ? handleCreateNetwork : handleCreate);

function transitionPageContent () {
	if ( DOM.state.contentSaving || DOM.state.contentChanging ) {
		return '';
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
		pubs = pubs
			? pubs + "," + pub
			: pub;
	}

	pages.current.set({
		Pubs: pubs,
		Modified: new Date()
	});

	return "/items(" + pages.current.ID + ")";
}

function getContentData ( itemPath ) {
	var id = ~~itemPath.replace(/\/items\((\d+)\)/, '$1');

	var data = {
		'ID': id,
		'Id': id,
		'__metadata': {
			'type': pages.current.listItemType
		},
		'Title': pages.current.Title,
		'Pubs': pages.current.Pubs,
		'Tags': pages.current.Tags,
		'Overview': pages.current.Overview,
		'Policy': pages.current.Policy,
		'Training': pages.current.Training,
		'Resources': pages.current.Resources,
		'Tools': pages.current.Tools,
		'Contributions': pages.current.Contributions
	};

	return data;
}

function showContentSaveSuccess () {
	DOM.setState({
		saveText: "Saved!",
		saveStyle: {
			backgroundColor: "#00B16A",
			color: "#FFFFFF"
		},
		contentSaving: false
	}, true, true, false, false);
}

function showContentSaveComplete () {
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

function showContentSaveFailure ( error ) {
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
}

function handleContentSave () {
	var itemPath = transitionPageContent();
	var data = getContentData(itemPath);

	db.saveItem(data);

	showContentSaveSuccess();
	showContentSaveComplete();
}

function handleContentSaveNetwork () {
	var itemPath = transitionPageContent();
	var data = getContentData(itemPath);

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
				url: sitePath + itemPath,
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
					showContentSaveSuccess();
				},
				error: function ( error ) {
					showContentSaveFailure(error);
				},
				complete: function () {
					showContentSaveComplete();
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
}

events.on("content.save", useNetwork ? handleContentSaveNetwork : handleContentSave);


function handleTitleSave ( titleInput ) {
	title = titleInput.replace(misc.regSanitize, "");
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

	var data = {
		'ID': pages.current.ID,
		'__metadata': {
			'type': pages.current.listItemType
		},
		'Title': title
	};

	db.saveItem(data);

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

	// Change UI back after 500ms
	setTimeout(function () {
		DOM.setState({
			titleChanging: false,
			titleStyle: {}
		}, true, true, true, false);
	}, 500);
}

function handleTitleSaveNetwork ( titleInput ) {
	title = titleInput.replace(misc.regSanitize, "");
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

	var data = {
		'__metadata': {
			'type': pages.current.listItemType
		},
		'Title': title
	};

	var itemPath = "/items(" + pages.current.ID + ")";

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
				url: sitePath + itemPath,
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
}

events.on("title.save", useNetwork ? handleTitleSaveNetwork : handleTitleSave);


function handleTagSave ( tags ) {
	DOM.setState({
		tagsChanging: true
	}, true, true, false, true);

	var data = {
		'ID': pages.current.ID,
		'__metadata': {
			'type': pages.current.listItemType
		},
		'Tags': tags
	};

	db.saveItem(data);

	pages.current.set({
		Tags: tags
	});
	DOM.setState({
		tagsChanging: false
	}, true, true, false, true);
}

function handleTagSaveNetwork ( tags ) {
	DOM.setState({
		tagsChanging: true
	}, true, true, false, true);

	var data = {
		'__metadata': {
			'type': pages.current.listItemType
		},
		'Tags': tags
	};

	var itemPath = "/items(" + pages.current.ID + ")";

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
				url: sitePath + itemPath,
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
}

events.on("tags.save", useNetwork ? handleTagSaveNetwork : handleTagSave);

module.exports = init;
