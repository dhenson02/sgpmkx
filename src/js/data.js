var events = require("./store").events,
	pages = require("./store").pages,
	reqwest = require("reqwest"),
	sweetAlert = require("sweetalert"),
	misc = require("./helpers"),
	inTransition = misc.inTransition,
	baseURL = _spPageContextInfo.webAbsoluteUrl,
	sitePath = baseURL + "/_api/lists/getByTitle('Content')",
	digest = document.getElementById("__REQUESTDIGEST").value/*,
	data = window.__PHDATA__,
	data_ = window.__PHDATA___*/;

events.on("page.loading", function () {
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
			events.emit("page.success", data);
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});
	/*setTimeout(function () {
		events.emit("page.success", data);
	}, 250);*/
});

events.on("content.loading", function ( path ) {
	console.log("Begin loadPage...");
	if ( !pages[path] ) {
		events.emit("missing", path);
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
			events.emit("content.loaded", data);
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});
	/*setTimeout(function () {
		events.emit("content.loaded", data_[pages[path].ID]);
	}, 250);*/
});

events.on("content.create", function ( data, path, title ) {
	reqwest({
		url: sitePath + "/items",
		method: "POST",
		data: JSON.stringify(data),
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
				text: title + " was created at <a href=\'#" + path + "\' target=\'_blank\'>" + path + "<\/a>",
				type: "success",
				html: true
			});
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});
	/*setTimeout(function () {
		events.emit("content.created", data_[pages[path].ID]);
	}, 250);*/
});

events.on("content.save", function ( data, id, self ) {
	self.innerHTML = "...saving...";
	reqwest({
		url: sitePath + "/items(" + id + ")",
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
	/*setTimeout(function () {
		events.emit("content.saved", data_[pages[path].ID]);
	}, 250);*/
});

module.exports = {
	/*data: data,
	data_: data_,*/
	baseURL: baseURL,
	sitePath: sitePath,
	digest: digest
};

