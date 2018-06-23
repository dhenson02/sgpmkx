'use strict';

var	sweetAlert = require("sweetalert");
var reqwest = require('reqwest');
var db = require("./db");
var	pages = require("./pages");
var DOM = require("./dom");
var {
	emitEvent,
	setupListeners
} = require("./events");
var misc = require("./helpers");
var useNetwork = false;

async function init () {
	function setOption ( data ) {
		pages.setOption(data.d.results.reduce(function ( obj, option ) {
			obj[option.Variable] = option.Value;
			return obj;
		}, {}));
	}

	if ( !useNetwork ) {
		await db.loadData();
		setOption(db.getData('/opt'));
		return emitEvent("page.loading");
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
			emitEvent("page.loading");
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
			emitEvent("page.loading-editor");
		},
		error: function ( err ) {
			console.log("Not a content manager (group 419) or connection error.  See details here: ", err);
		}
	});
});*/

setupListeners([
	"page.loading",
	"content.loading",
	"content.create",
	"content.save",
	"title.save",
	"tags.save"
], useNetwork);

module.exports = init;
