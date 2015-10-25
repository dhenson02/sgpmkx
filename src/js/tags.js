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

		var addTag = document.querySelector("input[name='ph-add-tag']");
		if ( DOM.state.tagsLocked || !addTag.value.trim() ) {
			return false;
		}
		var val = addTag.value.trim().replace(misc.regSpaces, "").replace(misc.regPubs, "").replace(misc.regSplit, ",").split(/,/g).filter(function ( tag ) {
			var regVal = new RegExp("\\b" + tag + "\\b", "gi");
			return !regVal.test(pages.current.Tags);
		}).join(",");
		addTag.value = "";
		addTag.focus();
		events.emit("tags.save", ( pages.current.Tags ? pages.current.Tags + "," + val : val ));
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
		var regVal = new RegExp("\\b" + val + "\\b,?", "i");
		events.emit("tags.save", pages.current.Tags.trim().replace(regVal, ""))
	};

	return (
		h(( DOM.state.tagsLocked ? ".locked" : ".unlocked" ), [
			h("label.ph-input-wrap", [
				h("input.ph-add-tag", {
					type: "text",
					name: "ph-add-tag",
					placeholder: "Add keyword(s)",
					autofocus: !DOM.state.tagsLocked,
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
				h("a.ph-add-tag-btn.icon.icon-right-arrow", {
					href: "#",
					role: "button",
					onclick: addTag
				})
			]),
			(
				pages.current.Tags ?
					h(".ph-tag-container", [
						h("i.icon.icon-lock", {
							role: "button",
							onclick: function () {
								DOM.setState({
									tagsLocked: !DOM.state.tagsLocked
								}, true, true, false, true);
							}
						}),
						h(".ph-tag-wrapper", [
							pages.current.Tags.split(/,/g).map(function ( tag ) {
								return ( tag.trim() ?
										h("small", {
											role: "button",
											onclick: removeTag
										}, [ tag.trim() ]) :
										null
								);
							})
						])
					]) :
					null
			)
		])
	);
}

module.exports = renderTags;
