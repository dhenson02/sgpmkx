var	pages = require("./store").pages,
	events = require("./store").events,
	reqwest = require("reqwest"),
	sweetAlert = require("sweetalert"),
	misc = require("./helpers"),
	inTransition = misc.inTransition,
	clicked = misc.clicked;

function init () {
	events.emit("page.loading");
}

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
						text: title + " was created at <a href=\'#" + path + "\' target=\'_blank\'>" + path + "<\/a>",
						type: "success",
						showConfirmButton: false,
						showCancelButton: false,
						html: true
					});
				},
				error: function ( error ) {
					sweetAlert({
						title: "Failure",
						text: title + " was <strong>not<\/strong> created at <a href=\'" + path + "\' target=\'_blank\'>" + path.slice(1) + "<\/a>",
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
				text: title + " was <strong>not<\/strong> created at <a href=\'" + path + "\' target=\'_blank\'>" + path.slice(1) + "<\/a>",
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
