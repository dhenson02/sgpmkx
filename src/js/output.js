var h = require("virtual-dom").h,
	misc = require("./helpers");

function OutputWidget ( text ) {
    this.text = String(text || "")
        .replace(misc.regPhone, '555-5555');
}

OutputWidget.prototype.type = "Widget";
OutputWidget.prototype.text = "";
OutputWidget.prototype.init = function () {
	var output = document.createElement("div");
	output.id = "ph-output";
	output.innerHTML = misc.md.render(String(this.text || "").replace(misc.regPhone, '555-5555'))
        .replace(misc.regLink, "<a target='_blank' $1")
        .replace(misc.regPhone, '555-5555');
	return output;
};
OutputWidget.prototype.update = function ( prev ) {
	return ( prev.text !== this.text ? this.init() : null );
};

module.exports = OutputWidget;
