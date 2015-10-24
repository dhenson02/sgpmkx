var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events");

function renderButtons ( DOM ) {
	return (
		h("div", [

			h("a#ph-save.ph-edit-btn" + ( !DOM.state.contentSaving ? "" : ".loading" ), {
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
			}, [ h("span.btn-title", [ !DOM.state.addingContent ? "New" : "Cancel" ]) ]),


			h("h1#ph-title" + ( !DOM.state.fullPage ? ".ph-cm" : "" ) + ( !DOM.state.titleChanging ? "" : ".loading" ), {
				contentEditable: ( !DOM.state.fullPage && !DOM.state.titleChanging ),
				style: DOM.state.titleStyle,
				onkeypress: function ( e ) {
					if ( e.which == 13 || e.keyCode == 13 ) {
						e = e || window.event;
						if ( e.stopPropagation ) e.stopPropagation();
						else if ( e.cancelBubble ) e.cancelBubble();
						if ( e.preventDefault ) e.preventDefault();
						else e.returnValue = false;
						this.blur();
						return false;
					}
				},
				onblur: function () {
					var title = this.textContent || this.innerText || this.innerHTML;
					title = title.trim();
					events.emit("title.save", title);
				}
			}, [ pages.current.Title ]),

			h("a#ph-toggle-editor.ph-btn", {
				href: "#",
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.stopPropagation ) e.stopPropagation();
					else if ( e.cancelBubble ) e.cancelBubble();
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					if ( DOM.state.fullPage && !pages.current[ DOM.state.tab ] && DOM.state.tab !== "Contributions" ) {
						events.emit("tab.change", "Overview");
					}
					DOM.setState({
						fullPage: !DOM.state.fullPage
					});
				}
			}, [ DOM.state.fullPage ? "edit" : "preview" ]),

			h("hr.hr-divider")
		])
	);
}

module.exports = renderButtons;
