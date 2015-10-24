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

			h("#ph-buttons", [ DOM.buttonsDOM ]),

			h("#ph-tabs", [ DOM.state.level > 1 ? DOM.tabsDOM : null ]),

			h("#ph-tags" + ( !DOM.state.tagsChanging ? "" : ".loading" ), [
				DOM.tagsDOM
			]),

			h("#ph-contentWrap" + ( !DOM.state.contentChanging && !DOM.state.contentSaving ? "" : ".loading" ), [
				h("#ph-input", [
					h("textarea#ph-textarea", [ pages.current[ DOM.state.tab ] ])
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

function renderDefault ( DOM ) {
	return (
		h("#ph-content", [
			h("h1#ph-title", [ pages.current.Title ]),
			h("#ph-tabs", [ DOM.state.level > 1 ? DOM.tabsDOM : null ]),
			h("#ph-contentWrap" + ( !DOM.state.contentChanging && !DOM.state.contentSaving ? "" : ".loading" ), [
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

			h("#ph-search-wrap", {
				style: ( !DOM.state.fullPage && pages.options.hideSearchWhileEditing ? { display: "none" } : {} )
			}, [ DOM.searchDOM ]),

			h("#ph-create-wrap", [ !DOM.state.addingContent ? null : renderAddContent(DOM) ]),

			h("#ph-side-nav", [ DOM.navDOM ]),

			( !misc.codeMirror ? renderDefault(DOM) : renderEditor(DOM) )
		])
	);
}

module.exports = renderPage;
