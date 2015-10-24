var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events");

function renderButtons ( DOM ) {
	return (
		h("#ph-buttons", [

			h("a#ph-toggle-editor.ph-btn", {
				href: "#",
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.preventDefault ) e.preventDefault();
					if ( e.cancelBubble ) e.cancelBubble();
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					if ( DOM.state.fullPage && !pages.current[ DOM.state.tab ] && DOM.state.tab !== "Contributions" ) {
						events.emit("tab.change", "Overview");
					}
					DOM.setState({
						fullPage: !DOM.state.fullPage
					});
				}
			}, [ DOM.state.fullPage ? "Show editor" : "Hide editor" ]),

			h("a#ph-create.ph-edit-btn", {
				href: "#",
				title: "New content page",
				style: ( phAddClass ? { display: "none" } : {}),
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.preventDefault ) e.preventDefault();
					if ( e.cancelBubble ) e.cancelBubble();
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					DOM.setState({
						addingContent: !DOM.state.addingContent
					}, true, true);
				}
			}, [ h("span.btn-title", [ !DOM.state.addingContent ? "Add content" : "Cancel" ]) ]),

			h("a#ph-save.ph-edit-btn" + ( DOM.state.saveText === "Save" ? "" : ".loading" ), {
				href: "#",
				title: "Save",
				style: DOM.state.saveStyle,
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.preventDefault ) e.preventDefault();
					if ( e.cancelBubble ) e.cancelBubble();
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					events.emit("content.save");
				}
			}, [ h("i.icon.icon-diskette", [ DOM.state.saveText ]) ])
		])
	);
}

module.exports = renderButtons;
