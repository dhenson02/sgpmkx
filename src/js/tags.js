var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events");

function renderTags ( DOM ) {
	var addTag = function ( e ) {
		e = e || window.event;
		if ( e.preventDefault ) e.preventDefault();
		if ( e.cancelBubble ) e.cancelBubble();
		if ( e.preventDefault ) e.preventDefault();
		else e.returnValue = false;

		var addTag = document.querySelector("input[name='ph-add-tag']"),
			val = addTag.value.trim().replace(misc.regSplit, " "),
			regVal = new RegExp(" ?\\b" + val + "\\b,? ?", "i");
		if ( val && !regVal.test(pages.current.Tags) ) {
			addTag.focus();
			events.emit("tags.save", ( pages.current.Tags ? pages.current.Tags + ", " + val : val ));
		}
	};

	var removeTag = function ( e ) {
		e = e || window.event;
		if ( e.preventDefault ) e.preventDefault();
		if ( e.cancelBubble ) e.cancelBubble();
		if ( e.preventDefault ) e.preventDefault();
		else e.returnValue = false;

		var val = this.textContent || this.innerText || this.innerHTML;
		val = val.trim();
		var regVal = new RegExp("\\b" + val + "\\b,? ?", "i");
		events.emit("tags.save", pages.current.Tags.replace(regVal, ""))
	};
	return (
		h(".ph-tags" + ( !DOM.state.tagsChanging ? "" : ".loading" ), [
			h(".ph-input-wrap", [
				h("input.ph-add-tag", {
					type: "text",
					name: "ph-add-tag",
					value: "",
					placeholder: "Add keyword(s)",
					autofocus: true,
					onkeypress: function ( e ) {
						if ( e.which == 13 || e.keyCode == 13 ) {
							e = e || window.event;
							if ( e.preventDefault ) e.preventDefault();
							if ( e.cancelBubble ) e.cancelBubble();
							if ( e.preventDefault ) e.preventDefault();
							else e.returnValue = false;
							addTag(e);
							return false;
						}
					}
				}),
				h("a.ph-add-tag-btn.icon.icon-plus", {
					href: "#",
					onclick: addTag
				})
			]),
			//h(".clearfix", { style: { padding: "5px" } }),
			( pages.current.Tags ?
				h("h4.ph-tag-wrapper", [
					pages.current.Tags.split(misc.regSplit).map(function ( tag ) {
						return ( tag.trim() ?
							h("small", {
								onclick: removeTag
							}, [ tag.trim() ]) :
							null );
					})
				]) : null )
		])
	);
}

module.exports = renderTags;
