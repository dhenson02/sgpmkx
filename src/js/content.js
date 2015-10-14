var events = require("./events");

function Content () {
	if ( !(this instanceof Content) ) {
		return new Content();
	}
	this.id = -1;
	this.title = "";
	this.keywords = [];
	this.icon = "";
	this.text = "";
	this.overview = "";
	this.policy = "";
	this.training = "";
	this.resources = "";
	this.tools = "";
	this.contributions = "";
	this.section = "";
	this.program = "";
	this.page = "";
	this.rabbitHole = "";
	this.type = "Overview";
	this.listItemType = "";
	this.timestamp = null;
	this.level = -1;
}

Content.prototype.set = function ( data ) {
	var name;
	for ( name in data ) {
		if ( this.hasOwnProperty(name) ) {
			this[name] = data[name];
		}
	}
	return this;
};

Content.prototype.savePage = function ( self ) {
	this.set({
		text: this.text.trim()
	});
	this[this.type.toLowerCase()] = this.text;
	var data = {
		'__metadata': {
			'type': this.listItemType
		},
		'Title': this.title,
		//'Keywords': this.keywords,
		'Overview': this.overview,
		'Policy': this.policy,
		'Training': this.training,
		'Resources': this.resources,
		'Tools': this.tools,
		'Contributions': this.contributions
	};
	self.className += " loading";
	var el = self.getElementsByTagName("i")[0];
	events.emit("content.save", data, this.id, el);
};

module.exports = Content;
