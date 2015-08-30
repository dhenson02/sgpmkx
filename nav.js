var h = require("virtual-dom/h");

function renderLink ( link ) {
  return (
    h(link.li, link.attr, [
      h("a", { href: link.path }, [
        String(link.title),
        h("span")
      ]),
      link.hr
    ])
  );
}

function renderSection ( section ) {
  var links = [],
    i = 0,
    count = section.links.length;
  for (; i < count; ++i) {
    links[i] = renderLink(section.links[i]);
  }
  return (
    h("li", [
      h("p.root-cat", [
        h("a", { "href": section.path }, [ String(section.title) ])
      ]),
      h("hr"),
      h("ul", links)
    ])
  );
}

function renderNav ( sections ) {
  var links = [],
    name;
  for ( name in sections ) {
    if ( sections.hasOwnProperty(name) ){
      links.push(renderSection(sections[name]));
    }
  }
  return (
    h("#ph-nav", [
      h(".header", [
        h("a", {
          "href": "#/"
        }, [
          h(".logo", [
            h("img", {
              "src": "/kj/kx7/PublicHealth/SiteAssets/Images/phLogo64-gs.png",
              "alt": "Public Health Home",
              "height": "64",
              "width": "64"
            })
          ]),
          h("p.text", [
            "Public Health",
            h("br"),
            h("small", [ "US Air Force" ])
          ])
        ])
      ]),
      h("ul.nav", links)
    ])
  );
}

module.exports = renderNav;
