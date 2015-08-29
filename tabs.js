var h = require("virtual-dom/h");

function render( style ) {
  return (
    h("ul#contentTabs", [
      h("li.tab", [
        h("a", {
          href: window.location.hash + "?tab=Policy",
          style: style
        }, [ "Policy" ])
      ]),
      h("li.tab", [
        h("a", {
          href: window.location.hash + "?tab=Utilities",
          style: style
        }, [ "Utilities" ])
      ]),
      h("li.tab", [
        h("a", {
          href: window.location.hash + "?tab=Community",
          style: style
        }, [ "Contributions" ])
      ])
    ])
  );
}

module.exports = render;
