var h = require("virtual-dom").h,
	pages = require("./pages"),
	events = require("./events"),
	horsey = require("horsey");

/*function SearchHook () {}

SearchHook.prototype.hook = function ( node /!*, name, prev*!/ ) {
	console.log(node);

};*/

function renderSearch () {
	return (
		h("label", [
			h("input#ph-search", {
				//horsey: new SearchHook(),
				type: "text",
				name: "ph-search",
				"tab-index": 1,
				onclick: function () {
					var self = this;
					horsey(self, {
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
							events.emit("content.found", item);
							self.value = "";
							return false;
						},
						render: function ( li, item ) {
							li.innerText = li.textContent = item.renderText;
						}
					});
				},
				placeholder: pages.options.searchPlaceholder
			})
		])
	);
}

module.exports = renderSearch;
