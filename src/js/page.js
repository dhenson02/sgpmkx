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

function renderEditor ( tabsDOM, DOM ) {

	var addTag = function ( e ) {
		e = e || window.event;
		if ( e.stopPropagation ) e.stopPropagation();
		else if ( e.cancelBubble ) e.cancelBubble();
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
		if ( e.stopPropagation ) e.stopPropagation();
		else if ( e.cancelBubble ) e.cancelBubble();
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


			h("a.ph-btn.ph-create", {
				href: "#",
				title: "New section",
				style: (( phAddClass ) ? { display: "none" } : {}),
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.stopPropagation ) e.stopPropagation();
					else if ( e.cancelBubble ) e.cancelBubble();
					if ( e.preventDefault ) e.preventDefault();
					else e.returnValue = false;

					DOM.setState({
						addingContent: !DOM.state.addingContent
					}, true, true);
				}
			}, [h("span.btn-title", [!DOM.state.addingContent ? "Add content" : "Cancel"])]),


			h("a.ph-toggle-editor", {
				href: "#",
				role: "button",
				onclick: function ( e ) {
					e = e || window.event;
					if ( e.stopPropagation ) e.stopPropagation();
					else if ( e.cancelBubble ) e.cancelBubble();
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
				style: ( DOM.state.titleBorder ? { borderBottomColor: "#00B16A" } : {} ),
				onkeypress: function ( e ) {
					if ( e.which == 13 || e.keyCode == 13 ) {
						this.blur();
						return false;
					}
				},
				onblur: function () {
					var title = this.textContent || this.innerText;
					title = title.trim();
					if ( title !== pages.current._title ) {
						if ( !DOM.state.titleChanging && pages.options.saveTitleAfterEdit ) {
							events.emit("title.save", title);
						}
					}
				}
			}, [String(pages.current.Title || "")]),


			h("#ph-tabs.ph-tabs", [tabsDOM]),


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
				h(".clearfix", { style: {padding: "5px"}}),
				( pages.current.Tags ? pages.current.Tags.split(regSplit).map(function ( tag ) {
					return ( tag.trim() ?
						h("small", {
							onclick: removeTag
						}, [String(tag)]) :
						null );
				}) : null )
			]),


			h("#ph-buttons", [
				h("a#ph-save.ph-edit-btn.ph-save" + ( DOM.state.saveText !== "Save" ? "" : ".loading" ), {
					href: "#",
					title: "Save",
					style: ( DOM.state.tempSaveStyle ? {
						color: "#00B16A",
						backgroundColor: "#FFFFFF"
					} : {
						backgroundColor: "#00B16A",
						color: "#FFFFFF"
					}),
					onclick: function ( event ) {
						event = event || window.event;
						if ( event.preventDefault ) event.preventDefault();
						else event.returnValue = false;

						if ( DOM.state.saveText === "Save" ) {
							events.emit("content.save");
						}
					}
				}, [h("i.icon.icon-diskette", [DOM.state.saveText])])
			]),


			h("#ph-contentWrap", [
				h("#ph-input", [
					h("textarea#ph-textarea", [String(pages.current.text || "")])
				]),
				h("#ph-output"),
				h(".clearfix"),
				h("small.ph-modified-date", [
					"Last updated: " + pages.current.Modified.toLocaleDateString()
				])
			])
		])
	);
}

function renderDefault ( tabsDOM ) {
	return (
		h("#ph-content.fullPage", [
			h("h1#ph-title", [String(pages.current.Title || "")]),
			h("#ph-tabs.ph-tabs", [tabsDOM]),
			h("#ph-contentWrap", [
				h("#ph-output"),
				h(".clearfix"),
				h("small.ph-modified-date", [
					"Last updated: " + pages.current.Modified.toLocaleDateString()
				])
			])
		])
	);
}

function renderPage ( navDOM, tabsDOM, DOM ) {
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
			h("#ph-side-nav", [navDOM]),
			( !misc.codeMirror ? renderDefault(tabsDOM) : renderEditor(tabsDOM, DOM) )
		])
	);
}

module.exports = renderPage;
