var h = require("virtual-dom").h,
	misc = require("./helpers"),
	pages = require("./pages"),
	events = require("./events");

function renderTags ( DOM ) {
	var addTag = function ( e ) {
		e = e || window.event;
		if ( e.stopPropagation ) e.stopPropagation();
		else if ( e.cancelBubble ) e.cancelBubble();
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
		if ( e.stopPropagation ) e.stopPropagation();
		else if ( e.cancelBubble ) e.cancelBubble();
		if ( e.preventDefault ) e.preventDefault();
		else e.returnValue = false;

		if ( DOM.state.tagsLocked ) {
			return false;
		}
		var val = this.textContent || this.innerText || this.innerHTML;
		val = val.trim();
		var regVal = new RegExp("\\b" + val + "\\b,? ?", "i");
		events.emit("tags.save", pages.current.Tags.replace(regVal, ""))
	};
	return (
		h("div", [
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
							if ( e.stopPropagation ) e.stopPropagation();
							else if ( e.cancelBubble ) e.cancelBubble();
							if ( e.preventDefault ) e.preventDefault();
							else e.returnValue = false;
							addTag(e);
							return false;
						}
					}
				}),
				h("a.ph-add-tag-btn.icon.icon-plus", {
					href: "#",
					role: "button",
					onclick: addTag
				})
			]),
			(
				pages.current.Tags ?
					h("div", [
						h("i.icon.icon-lock" + ( DOM.state.tagsLocked ? ".locked" : ".unlocked" ), {
							role: "button",
							onclick: function () {
								DOM.setState({
									tagsLocked: !DOM.state.tagsLocked
								}, true, true, false, true);
							}
						}),
						h("h4.ph-tag-wrapper" + ( DOM.state.tagsLocked ? ".loading" : "" ), [
							pages.current.Tags.split(misc.regSplit).map(function ( tag ) {
								return ( tag.trim() ?
									h("small", {
										role: "button",
										onclick: removeTag
									}, [ tag.trim() ]) :
									null );
							})
						])
					]) :
					null
			)
		])
	);
}

module.exports = renderTags;
