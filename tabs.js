var h = require("virtual-dom/h");

function renderTab ( title, launch ) {
  return (
    h("li.tab", [
      h("a", {
        href: "#",
        onclick: function(e) {
          e = e || window.event;
          if (e.preventDefault) e.preventDefault();
          else e.returnValue = false;
          return launch(title);
        }
      }, [ title ])
    ])
  );
}

function render ( tabs, style, launch ) {
  var group = [],
    name;
  for ( name in tabs ) {
    if ( tabs.hasOwnProperty(name) && tabs[name] > 1 ) {
      group.push(renderTab(name, launch));
    }
  }
  return h("ul#contentTabs", style, group);
}

module.exports = render;
