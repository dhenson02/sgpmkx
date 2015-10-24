var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events"),
	regSplit = misc.regSplit;

/*function renderLoader() {
	return (
		h("#ph-loader.loader-group", [
			h(".bigSqr", [
				h(".square.first"),
				h(".square.second"),
				h(".square.third"),
				h(".square.fourth")
			]),
			h(".text", ["loading..."])
		])
	);
}*/

function renderAddContent () {
	return (
		h("fieldset", [
			h("legend", ["Many things to be added soon"]),
		/**
		 * Iterate path into X number of horsey instances (use div)
		 * Underneath show live view of what URI is going to be
		 */
			h("label", [
				"Title",
				h("input.ph-title-input", {
					oninput: function ( e ) {
						this.value = pages.current.Modified.toLocaleString();
						return e;
					}
				})
			]),
			h("label", [
				"Name",
				h("input.ph-name-input", {
					oninput: function ( e ) {
						return e;
					}
				})
			]),
			h("label", [
				"Path",
				h("input.ph-path-input", {
					oninput: function ( e ) {
						return e;
					}
				})
			])
		])
	);
}

function renderEditor ( DOM ) {

	var addTag = function ( e ) {
		e = e || window.event;
		if ( e.preventDefault ) e.preventDefault();
		else e.returnValue = false;

		var addTag = document.querySelector("input[name='ph-add-tag']"),
			val = addTag.value.trim(),
			regVal = new RegExp(" ?\\b" + val + "\\b,? ?", "i");
		if ( val && !regVal.test(pages.current.Tags) ) {
			addTag.focus();
			events.emit("tags.save", ( pages.current.Tags ? pages.current.Tags + ", " + val : val ));
		}
	};

	var removeTag = function ( e ) {
		e = e || window.event;
		if ( e.preventDefault ) e.preventDefault();
		else e.returnValue = false;

		var val = this.textContent || this.innerText || this.innerHTML;
		val = val.trim();
		var regVal = new RegExp("\\b" + val + "\\b,? ?", "i");
		events.emit("tags.save", pages.current.Tags.replace(regVal, ""))
	};

	return (
		h("#ph-content" + ( DOM.state.fullPage ? ".fullPage" : "" ), [


			h("#ph-create-wrap", [!DOM.state.addingContent ? null : renderAddContent()]),


			h("a#ph-create.ph-btn", {
				href: "#",
				title: "New content page",
				style: ( phAddClass ? { display: "none" } : {}),
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					DOM.setState({
						addingContent: !DOM.state.addingContent
					}, true, true);
				}
			}, [ h("span.btn-title", [!DOM.state.addingContent ? "Add content" : "Cancel"]) ]),


			h("a.ph-toggle-editor", {
				href: "#",
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					if ( DOM.state.fullPage && !pages.current[DOM.state.tab] && DOM.state.tab !== "Contributions" ) {
						events.emit("tab.change", "Overview");
					}
					DOM.setState({
						fullPage: !DOM.state.fullPage
					});
				}
			}, [DOM.state.fullPage ? "Show editor" : "Hide editor"]),


			h("h1#ph-title.ph-cm" + ( !DOM.state.titleChanging ? "" : ".loading" ), {
				contentEditable: !DOM.state.titleChanging,
				style: DOM.state.titleStyle,
				onkeypress: function ( e ) {
					if ( e.which == 13 || e.keyCode == 13 ) {
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


			h("#ph-tabs.ph-tabs", [ DOM.tabsDOM ]),


			h("#ph-buttons", [
				h("a#ph-save.ph-edit-btn" + (
						( DOM.state.saveText === "Save" ) ? "" : ".loading"
					), {
					href: "#",
					title: "Save",
					style: DOM.state.saveStyle,
					onclick: function ( e ) {
						e = e || window.event;
						if ( e.preventDefault ) e.preventDefault();
						else e.returnValue = false;
						events.emit("content.save");
					}
				}, [h("i.icon.icon-diskette", [DOM.state.saveText])])
			]),


			h("h3.ph-tags" + ( !DOM.state.tagsChanging ? "" : ".loading" ), [
				h("input.ph-add-tag", {
					type: "text",
					name: "ph-add-tag",
					value: "",
					placeholder: "Add keyword(s)",
					autofocus: true,
					onkeypress: function ( e ) {
						if ( e.which == 13 || e.keyCode == 13 ) {
							addTag(e);
							return false;
						}
					}
				}),
				h("a.icon.icon-plus", {
					href: "#",
					onclick: addTag
				}),
				h(".clearfix", { style: { padding: "5px" } }),
				( pages.current.Tags ? pages.current.Tags.split(regSplit).map(function ( tag ) {
					return ( tag.trim() ?
						h("small", {
							onclick: removeTag
						}, [String(tag)]) :
						null );
				}) : null )
			]),


			h("#ph-contentWrap", [
				h("#ph-input", [
					h("textarea#ph-textarea", [ pages.current[DOM.state.tab] ])
				]),
				//( (DOM.state.fullPage && DOM.state.level > 1) ? h("h2", [ DOM.state.tab ]) : h("") ),
				h("#ph-output"),
				h(".clearfix"),
				h("small.ph-modified-date", [
					"Last updated: " + pages.current.Modified.toLocaleDateString()
				])
			])
		])
	);
}

function renderDefault ( DOM ) {
	return (
		h("#ph-content.fullPage", [
			h("h1#ph-title", [ pages.current.Title ]),
			h("#ph-tabs.ph-tabs", [ DOM.tabsDOM ]),
			h("#ph-contentWrap", [
				//( DOM.state.level > 1 ? h("h2", [ DOM.state.tab ]) : h("") ),
				h("#ph-output"),
				h(".clearfix"),
				h("small.ph-modified-date", [
					"Last updated: " + pages.current.Modified.toLocaleDateString()
				])
			])
		])
	);
}

function renderPage ( DOM ) {
	return (
		h("#ph-wrapper", [
			h("#ph-search-wrap", {
				style: ( !DOM.state.fullPage && pages.options.hideSearchWhileEditing ? { display: "none" } : {} )
			}, [
				h("label", [
					h("input#ph-search", {
						type: "text",
						name: "ph-search",
						"tab-index": 1,
						placeholder: pages.options.searchPlaceholder
					})
				])
			]),
			h("#ph-side-nav", [ DOM.navDOM ]),
			( !misc.codeMirror ? renderDefault(DOM) : renderEditor(DOM) )
		])
	);
}

module.exports = renderPage;
