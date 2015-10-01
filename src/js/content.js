var h = require("virtual-dom/h"),
	codeMirror = require("./helpers").codeMirror,
	pages = require("./store").pages,
	events = require("./store").events,
	current = pages.current;

var Content = function () {
	this.text = current.text;
	this.title = current.title;
};
Content.prototype.type = "Widget";
Content.prototype.init = function () {
	var el = document.createElement("div");
	el.id = "output";
	el.innerHTML = misc.md.render("## " + type + "\n" + text);
	return el;
};
Content.prototype.update = function ( previous, domNode ) {};
Content.prototype.destroy = function ( domNode ) {};

function update ( e ) {
	var val = e.getValue();
	insertContent(val, current.type);
	current.set({
		text: val
	});
}

function insertContent ( text, type ) {
}
