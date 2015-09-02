var h = require("virtual-dom/h");

function renderTab ( title, handleClick ) {
  return (
    h("li", [
      h("a.icon.icon-" + title.toLowerCase(), {
        href: "#",
        onclick: function ( e ) {
          e = e || window.event;
          if ( e.preventDefault ) e.preventDefault();
          else e.returnValue = false;
          handleClick(title);
          return false;
        }
      }, [ h("span", [String(title)]) ])
    ])
  );
}

function render ( tabs, style, launch ) {

  var group = [],
    name;
  for ( name in tabs ) {
    if ( tabs.hasOwnProperty(name) /*&& tabs[name] > 1*/ ) {
      group.push(renderTab(name, launch));
    }
  }
  return (
    h("#ph-tabs.ph-tabs.ph-tabs-style-iconbox", [
      h("nav", [
        h("ul", style, group)
      ])
    ])
  );
}

module.exports = render;
