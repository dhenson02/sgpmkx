var h = require("virtual-dom").h,
	pages = require("./pages"),
	//events = require("./events"),
	horsey = require("horsey");

function SearchHook () {}

SearchHook.prototype.hook = function ( node /*, name, prev*/ ) {
	horsey(node, {
		suggestions: pages.titles,
		autoHideOnBlur: false,
		limit: 8,
		getValue: function ( item ) {
			return item.value;
		},
		getText: function ( item ) {
			return item.text;
		},
		set: function ( item ) {
			router.setRoute(item);
			node.value = "";
			return false;
		},
		render: function ( li, item ) {
			li.innerText = li.textContent = item.renderText;
		}
	});
};

function renderSearch () {
	return (
		h("label", [
			h("input#ph-search", {
				horsey: new SearchHook(),
				type: "text",
				name: "ph-search",
				"tab-index": 1,
				placeholder: pages.options.searchPlaceholder
			})
		])
	);
}

module.exports = renderSearch;
