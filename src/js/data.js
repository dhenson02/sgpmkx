var	pages = require("./pages"),
	events = require("./events"),
	reqwest = require("reqwest"),
	sweetAlert = require("sweetalert"),
	misc = require("./helpers"),
	inTransition = misc.inTransition,
	clicked = misc.clicked,
	reduce = require("lodash/collection/reduce");

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
		url: baseURL + "/_api/lists/getByTitle('Options')/items/?$select=Variable,Value",
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
			var options = reduce(data.d.results, function ( setup, option ) {
				setup[option.Variable] = option.Value;
				return setup;
			}, {});
			console.log("options: ", options);
			pages.set({ options: options });
			console.log("pages.options: ", pages.options);
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
		url: sitePath + "/items/?$select=ID,Title,Icon,Section,Program,Page,rabbitHole,Keywords,References,Link",
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

events.on("content.save", function ( data, id, self ) {
	self.removeAttribute("style");
	self.innerHTML = "...saving...";
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
				url: sitePath + "/items(" + id + ")",
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
					self.parentNode.className = self.parentNode.className.replace(/ ?loading/gi, "");
					self.style.fontWeight = "bold";
					self.innerHTML = "Saved!";
				},
				error: function ( error ) {
					self.parentNode.className = self.parentNode.className.replace(/ ?loading/gi, "");
					self.style.color = "#FF2222";
					self.style.fontWeight = "bold";
					self.innerHTML = "Connection error (press F12 for Console)";
					console["error" || "log"]("Couldn't save due to error: ", error.response);
				},
				complete: function () {
					inTransition.tempSaveText = setTimeout(function () {
						self.removeAttribute("style");
						self.innerHTML = "Save";
						inTransition.tempSaveText = null;
					}, 1500);
				}
			});
		},
		error: function ( error ) {
			self.parentNode.className = self.parentNode.className.replace(/ ?loading/gi, "");
			self.style.color = "#FF2222";
			self.style.fontWeight = "bold";
			self.innerHTML = "Digest error (press F12 for Console)";
			console["error" || "log"]("Couldn't save due to error retrieving new digest: ", error.response);
			console.log("Error getting new digest: ", error);
		},
		complete: function () {
			inTransition.tempSaveText = setTimeout(function () {
				self.removeAttribute("style");
				self.innerHTML = "Save";
				inTransition.tempSaveText = null;
			}, 1500);
		}
	});
});

module.exports = init;
