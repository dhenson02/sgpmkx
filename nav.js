var h = require("virtual-dom/h");

function render ( comm, fhm ) {
  return (
    h("div#navWrap.nav", [
      h("div.header", [
        h("a", {
          "href": "#/"
        }, [
          h("div.logo", [
            h("img", {
              "src": "/kj/kx7/PublicHealth/SiteAssets/Pages/landing/phLogo48-gs.png",
              "alt": "Public Health Home",
              "height": "48",
              "width": "48"
            })
          ]),
          h("p.text", [ "Public Health", h("br"), h("small", [ "US Air Force" ]) ])
        ])
      ]),
      h("ul", [
        h("li", [
          h("p.root-cat", [
            h("a", {
              "href": "#/Comm"
            }, [ "Community Health" ])
          ]),
          h("hr"),
          h("ul", comm)
        ]),
        h("li", [
          h("p.root-cat", [
            h("a", {
              "href": "#/FHM"
            }, [ "Force Health Management" ])
          ]),
          h("hr"),
          h("ul", fhm)
        ])
      ])
    ])
  );
}

module.exports = render;
