var express = require('express');
var app = express();
var fs = require("fs");
var where = require("lodash/collection/where");
var reduce = require("lodash/collection/reduce");
var timer = null;

var db = JSON.parse(fs.readFileSync(__dirname + "/db.json", { charset: "utf8" }));
var db_ = reduce(db, function ( obj, item ) {
	obj[item.ID] = { d: item };
	return obj;
}, {});

app.get("/items", function ( req, res ) {
	if ( timer ) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		res.send({ "d": { "results": db }});
	}, 500);
});

app.get("/items(:id)", function ( req, res ) {
	var id = req.params.id.slice(1,-1);
	if ( timer ) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		res.send(db_[id]);
	}, 500);
});

app.post("/items(:id)", function ( req, res ) {
	res.send('Item POST: ' + req.params.id);
});

app.put('/items', function ( req, res ) {
	res.send('CREATE');
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
