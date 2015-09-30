var events = require("./store").events,
	pages = require("./store").pages,
	reqwest = require("reqwest"),
	baseURL = _spPageContextInfo.webAbsoluteUrl,
	sitePath = baseURL + "/_api/lists/getByTitle('Content')",
	digest = document.getElementById("__REQUESTDIGEST").value;/*
	data = window.__PHDATA__,
	data_ = window.__PHDATA___;*/

events.on("list.loading", function () {
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
			events.emit("list.success", data);
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});
	/*setTimeout(function () {
		events.emit("list.success", data);
	}, 250);*/
});

events.on("page.loading", function ( path ) {
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
			events.emit("page.loaded", data);
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});
	/*setTimeout(function () {
		events.emit("page.loaded", data_[pages[path].ID]);
	}, 250);*/
});

module.exports = {
	/*data: data,
	data_: data_,*/
	baseURL: baseURL,
	sitePath: sitePath,
	digest: digest
};

