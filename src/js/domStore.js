function DOMRef () {
	if ( !(this instanceof DOMRef) ) {
		return new DOMRef();
	}
	this.content = document.getElementById("ph-content");
	this.title = document.getElementById("ph-title");
	this.buttons = document.getElementById("ph-buttons");
	this.titleField = document.getElementById("titleField");
	this.contentWrap = document.getElementById("ph-contentWrap");
	this.cheatSheet = document.getElementById("cheatSheet");
	this.input = document.getElementById("ph-input");
	this.textarea = document.getElementById("ph-textarea");
	this.editor = null;
	this.output = document.getElementById("ph-output");
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

/*DOMRef.prototype.updateDOM = function  ( refreshDOM ) {
	var patches = diff(dirtyDOM, refreshDOM);
	rootNode = patch(rootNode, patches);
	dirtyDOM = refreshDOM;
	/!*domRefs = new DOMRef();*!/
};*/

var domRefs = new DOMRef();
//var rootNode, dirtyDOM;

module.exports = {
	DOMRef: DOMRef,
	domRefs: domRefs
};
