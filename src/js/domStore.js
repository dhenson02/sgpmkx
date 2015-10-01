function DOMRef () {
	if ( !(this instanceof DOMRef) ) {
		return new DOMRef();
	}
}

DOMRef.prototype.set = function ( data ) {
	var name;
	for ( name in data ) {
		if ( this.hasOwnProperty(name) ) {
			this[name] = data[name];
		}
	}
	return this;
};

DOMRef.prototype.update = function  ( refreshDOM ) {
	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	this.reset();
};

DOMRef.prototype.reset = function () {
	this.content = document.getElementById("ph-content");
	this.title = document.getElementById("ph-title");
	this.buttons = document.getElementById("ph-buttons");
	//this.contentWrap = document.getElementById("ph-contentWrap");
	this.cheatSheet = document.getElementById("cheatSheet");
	this.input = document.getElementById("ph-input");
	this.textarea = document.getElementById("ph-textarea");
	this.editor = null;
	this.output = document.getElementById("ph-output");
};

var DOM = new DOMRef();
var rootNode, dirtyDOM;

/*module.exports = {
	DOMRef: DOMRef,
	domRefs: domRefs
};*/

module.exports = DOM;
