var h = require("virtual-dom").h,
	misc = require("./helpers");

function OutputWidget ( text ) { this.text = text || "" }

OutputWidget.prototype.type = "Widget";
OutputWidget.prototype.text = "";
OutputWidget.prototype.init = function () {
	var output = document.createElement("div");
	output.id = "ph-output";
	output.innerHTML = misc.md.render(this.text).replace(misc.regLink, "<a target='_blank' $1");
	return output;
};
OutputWidget.prototype.update = function ( prev ) {
	return ( prev.text !== this.text ? this.init() : null );
};

module.exports = OutputWidget;
