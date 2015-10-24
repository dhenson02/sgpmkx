var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events");

/*function renderLoader () {
 return (
 h("#ph-loader", [
 h(".loader-group", [
 h(".bigSqr", [
 h(".square.first"),
 h(".square.second"),
 h(".square.third"),
 h(".square.fourth")
 ]),
 h(".text", [ "loading..." ])
 ])
 ])
 );
 }*/

function renderAddContent ( DOM ) {
	return (
		h("fieldset", [
			h("legend", [ "Many things to be added soon" ]),
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
	return (
		h("#ph-content", [

			DOM.buttonsDOM,

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

			h("#ph-tabs", [ DOM.state.level > 1 ? DOM.tabsDOM : null ]),

			DOM.tagsDOM,

			h("#ph-contentWrap", [
				h("#ph-input", [
					h("textarea#ph-textarea", [ pages.current[ DOM.state.tab ] ])
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
			h("#ph-tabs", [ DOM.state.level > 1 ? DOM.tabsDOM : null ]),
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
		h("#ph-wrapper" + ( DOM.state.fullPage ? ".fullPage" : "" ), [

			h("#ph-create-wrap", [ !DOM.state.addingContent ? null : renderAddContent(DOM) ]),

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
