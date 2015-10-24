var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events");

function renderButtons ( DOM ) {
	return (
		h("div", [

			h("a#ph-save.ph-edit-btn" + ( DOM.state.saveText === "Save" ? "" : ".loading" ), {
				href: "#",
				title: "Save",
				style: DOM.state.saveStyle,
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.stopPropagation ) e.stopPropagation();
					else if ( e.cancelBubble ) e.cancelBubble();
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					events.emit("content.save");
				}
			}, [ h("i.icon.icon-diskette", [ DOM.state.saveText ]) ]),


			h("a#ph-create.ph-edit-btn", {
				href: "#",
				title: "New content page",
				style: ( phAddClass ? { display: "none" } : {}),
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.stopPropagation ) e.stopPropagation();
					else if ( e.cancelBubble ) e.cancelBubble();
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					DOM.setState({
						addingContent: !DOM.state.addingContent
					}, true, true, true, false);
				}
			}, [ h("span.btn-title", [ !DOM.state.addingContent ? "New" : "Cancel" ]) ])
		])
	);
}

module.exports = renderButtons;
