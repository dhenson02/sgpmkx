var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events");

function InputWidget () {}
InputWidget.prototype.config = {
	mode: 'gfm',
	matchBrackets: true,
	lineNumbers: false,
	lineWrapping: true,
	undoDepth: 1000,
	tabSize: 2,
	lineSeparator: "\n",
	theme: phEditorTheme,
	extraKeys: {
		"Enter": "newlineAndIndentContinueMarkdownList",
		"Ctrl-S": function () {
			events.emit("content.save");
		}
	}
};
InputWidget.prototype.hook = function () {
	var textarea = document.createElement("textarea");
	textarea.id = "ph-textarea";
	this.editor = misc.codeMirror.fromTextArea(textarea, config);
	this.editor.on("change", function ( e ) {
		pages.current.set(self.state.tab, e.getValue());
		self.update(true, true, true, true);
	});
};

function renderInput ( DOM ) {

}
