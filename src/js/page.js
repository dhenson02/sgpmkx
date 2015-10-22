var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events"),
	regSplit = misc.regSplit;

/*
function renderLoader() {
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
}
*/

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
						this.value = pages.current.modified.toLocaleString();
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

	var addTag = function ( event ) {
		event = event || window.event;
		if ( event.preventDefault ) event.preventDefault();
		else event.returnValue = false;

		var addTag = document.querySelector("input[name='ph-add-tag']"),
			val = addTag.value.trim(),
			regVal = new RegExp(" ?\\b" + val + "\\b ?", "i");
		if ( val && !regVal.test(pages.current.tags) ) {
			pages.current.set({
				tags: ( pages.current.tags ? pages.current.tags + " " + val : val)
			});
			DOM.update(true, true);
			addTag.focus();
		}
	};

	var removeTag = function ( event ) {
		event = event || window.event;
		if ( event.preventDefault ) event.preventDefault();
		else event.returnValue = false;

		var val = this.textContent || this.innerText || this.innerHTML;
		val = val.trim();
		var regVal = new RegExp(" ?\\b" + val + "\\b ?", "i");
		pages.current.set({
			tags: pages.current.tags.replace(regVal, "")
		});
		DOM.update(true, true);
	};

	return (
		h("#ph-content" + ( DOM.state.fullPage ? ".fullPage" : "" ), [


			h("#ph-create-wrap", [DOM.state.addingContent ? renderAddContent() : null]),


			h("a.ph-btn.ph-create", {
				href: "#",
				title: "New section",
				style: (( phAddClass ) ? { display: "none" } : {}),
				onclick: function ( event ) {
					event = event || window.event;
					if ( event.preventDefault ) event.preventDefault();
					else event.returnValue = false;

					DOM.setState({ addingContent: !DOM.state.addingContent });
				}
			}, [h("span.btn-title", [DOM.state.addingContent ? "Cancel" : "Add content"])]),


			h("a.ph-toggle-editor", {
				href: "#",
				role: "button",
				onclick: function ( event ) {
					event = event || window.event;
					if ( event.preventDefault ) event.preventDefault();
					else event.returnValue = false;

					if ( DOM.state.fullPage && !pages.current[pages.current._type] && pages.current._type !== "contributions" ) {
						events.emit("tab.change", "Overview");
					}
					DOM.setState({
						fullPage: !DOM.state.fullPage
					});
				}
			}, [DOM.state.fullPage ? "Show editor" : "Hide editor"]),


			h("h1#ph-title.ph-cm" + ( !misc.inTransition.title ? "" : ".loading" ), {
				contentEditable: !misc.inTransition.title,
				style: ( misc.inTransition.titleBorder ? { borderBottomColor: "#00B16A" } : {} ),
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
						pages.current.set({
							title: title
						});
						if ( misc.inTransition.title || !pages.options.saveTitleAfterEdit ) {
							return false;
						}
						misc.inTransition.title = true;
						DOM.update(false, true);
						//this.contentEditable = false;
						//this.className += " loading";
						events.emit("title.saving", title);
					}
				}
			}, [String(pages.current.title || "")]),


			h("#ph-tabs.ph-tabs", [tabsDOM]),


			h("h3.ph-tags", [
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
				( pages.current.tags ? pages.current.tags.split(regSplit).map(function ( tag ) {
					return ( tag.trim() ?
						h("small", {
							onclick: removeTag
						}, [String(tag)]) :
						null );
				}) : null )
			]),


			h("#ph-buttons", [
				h("a#ph-save.ph-edit-btn.ph-save" + ( !misc.inTransition.tempSaveText ? "" : ".loading" ), {
					href: "#",
					title: "Save",
					style: ( misc.inTransition.tempSaveStyle ? {
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

						if ( !misc.inTransition.tempSaveText ) {
							misc.inTransition.tempSaveText = "...saving...";
							DOM.update(true, true);
							pages.current.savePage();
						}
					}
				}, [h("i.icon.icon-diskette", [!misc.inTransition.tempSaveText ? "Save" : misc.inTransition.tempSaveText])])
			]),


			h("#ph-contentWrap", [
				h("#ph-input", [
					h("textarea#ph-textarea", [String(pages.current.text || "")])
				]),
				h("#ph-output"),
				h(".clearfix"),
				h("small.ph-modified-date", [
					"Last updated: " + pages.current.modified.toLocaleDateString()
				])
			])
		])
	);
}

function renderDefault ( tabsDOM ) {
	return (
		h("#ph-content.fullPage", [
			h("h1#ph-title", [String(pages.current.title || "")]),
			h("#ph-tabs.ph-tabs", [tabsDOM]),
			h("#ph-contentWrap", [
				h("#ph-output")
			])
		])
	);
}

function renderPage ( navDOM, tabsDOM, DOM ) {
	return (
		h("#ph-wrapper", [
			h("#ph-search-wrap", {
				style: ( pages.options.hideSearchWhileEditing && !DOM.state.fullPage ? { display: "none" } : {} )
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
			( ( misc.codeMirror ) ? renderEditor(tabsDOM, DOM) : renderDefault(tabsDOM) )
		])
	);
}

module.exports = renderPage;
