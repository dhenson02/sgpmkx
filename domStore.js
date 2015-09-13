function DOMRef () {
	if ( !(this instanceof DOMRef) ) {
		return new DOMRef();
	}
	this.content = document.getElementById("content");
	this.title = document.getElementById("ph-title");
	this.buttons = document.getElementById("ph-buttons");
	this.titleField = document.getElementById("titleField");
	this.contentWrap = document.getElementById("contentWrap");
	this.cheatSheet = document.getElementById("cheatSheet");
	this.input = document.getElementById("input");
	this.textarea = document.getElementById("textarea");
	this.editor = null;
	this.output = document.getElementById("output");
	this.set = function ( data ) {
		var name;
		for ( name in data ) {
			if ( this.hasOwnProperty(name) ) {
				this[name] = data[name];
			}
		}
		return this;
	};
}

module.exports = DOMRef;
