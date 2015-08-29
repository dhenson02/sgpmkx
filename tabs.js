var h = require("virtual-dom/h");

function render() {
  return (
    h("ul#contentTabs", [
      h("li.tab", [
        h("a", {
          href: window.location.hash + "?tab=Policy"
        }, [ "Policy" ])
      ]),
      h("li.tab", [
        h("a", {
          href: window.location.hash + "?tab=Utilities"
        }, [ "Utilities" ])
      ]),
      h("li.tab", [ h("a", {
        href: window.location.hash + "?tab=Community"
      }, [ "Contributions" ])
      ])
    ])
  );
}

module.exports = render;
