var express = require('express');
var app = express();
var fs = require("fs");
var map = require("lodash/collection/map");
var mapValues = require("lodash/object/mapValues");
var reduce = require("lodash/collection/reduce");
var assign = require("lodash/object/assign");

var bp = require("body-parser");
var cors = require("cors");

app.use(bp.json());
app.use(cors());

var timer = null;
var cmTimer = null;

var db = {d: { results: JSON.parse(fs.readFileSync(__dirname + "/db.json", { charset: "utf8" })) } };
var db_ = reduce(db.d.results, function ( obj, item ) {
	obj[item.ID] = { d: item };
	return obj;
}, {});

app.get("/items", function ( req, res ) {
	if ( timer ) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		res.send(db);
	}, 120);
});

app.post("/Pages/content/_api/contextinfo", function ( req, res ) {
	if ( timer ) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		res.send({
			d: {
				GetContextWebInformation: {
					FormDigestValue: "1234"
				}
			}
		});
	}, 120);
});

app.get("/opt", function ( req, res ) {
	if ( cmTimer ) {
		clearTimeout(cmTimer);
	}
	cmTimer = setTimeout(function () {
		res.send({ d: { results: [
			{Variable: "hideSearchWhileEditing", Value: "false"}, { Variable: "images", Value: "img" }] } });
	}, 120);
});

app.get("/check/true", function ( req, res ) {
	if ( cmTimer ) {
		clearTimeout(cmTimer);
	}
	cmTimer = setTimeout(function () {
		res.send({ status: "success" });
	}, 120);
});

app.get("/items(:id)", function ( req, res ) {
	var id = req.params.id.slice(1,-1);
	if ( timer ) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		res.send(db_[id]);
	}, 120);
});

// Save
app.post("/items(:id)", function ( req, res ) {
	var id = req.params.id.slice(1, -1);
	var data = mapValues(req.body, function ( val, key ) {
		if ( key === "__metadata" ) {
			return db_[id].d.__metadata;
		}
		return ( Array.isArray(val) ) ? { results: val } : val;
	});
	data.ID = id;
	data.Id = id;
	db_[id].d = assign(db_[id].d, data);
	db.d.results = map(db.d.results, function ( item ) {
		if ( item.ID === id ) {
			item = db_[id].d;
		}
		return item;
	});
	fs.writeFileSync(__dirname + "/db.json", JSON.stringify(db.d.results), { charset: "utf8" });

	if ( timer ) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		res.send({ status: "success" });
	}, 120);
});

// Create
app.post('/items', function ( req, res ) {
	var id = Number(Object.keys(db_).sort(function ( x, y ) { return x - y; }).pop()) + 1;
	var data = mapValues(req.body, function ( val ) {
		return ( Array.isArray(val) ) ? { results: val } : val;
	});
	data.ID = id;
	data.Id = id;
	db.d.results.push(data);
	db_[id] = { d: data };
	fs.writeFileSync(__dirname + "/db.json", JSON.stringify(db.d.results), { charset: "utf8" });
	if ( timer ) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		res.send({ status: "success" });
	}, 120);
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
