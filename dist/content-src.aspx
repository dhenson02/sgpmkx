<!DOCTYPE html>
<meta charset="UTF-8"/>
<style type="text/css">
@charset "UTF-8";
body { opacity: 0; }
body { opacity: 1; }
</style>
<title>Velocity Raptinators</title>
<script type="text/javascript">
//<![CDATA[

	var	baseURL = _spPageContextInfo.webAbsoluteUrl,
		sitePath = baseURL + "/_api/lists/getByTitle('Content')",
		phImages = "/kj/kx7/PublicHealth/SiteAssets/Images",
		phLive = true,
		phEditorTheme = "base16-light",
		phSearchPlaceholder = "Search using keywords, AFIs or titles...";

    /* Get rid of the ugly nav on the left if it's there */
    try {
        var leftNav = document.getElementById("leftnav");
        leftNav.parentNode.removeChild(leftNav);
    } catch (e) {}

    var phWrapper = document.createElement("div");
    phWrapper.id = "wrapper";
	try {
		var phWrapperTemp = document.getElementById("wrapper");
		phWrapperTemp.parentNode.replaceChild(phWrapper, phWrapperTemp);
	}
	catch ( e ) {
		try {
			phWrapperTemp = document.querySelector(".tabs-wrapper + div");
			phWrapperTemp.parentNode.replaceChild(phWrapper, phWrapperTemp);
		} catch ( e ) {
			document.body.appendChild(phWrapper);
		}
	}

	phWrapper.innerHTML = "<div class='loading'><div class='loader-group'><div class='bigSqr'><div class='square first'></div><div class='square second'></div><div class='square third'></div><div class='square fourth'></div></div>loading...</div></div>";


//]]>
</script>
<style type="text/css">
@import url("/kj/kx7/PublicHealth/Pages/Dev/editor.min.css");
@import url("/kj/kx7/PublicHealth/Pages/Dev/base16-light.css");
@import url("/kj/kx7/PublicHealth/SiteAssets/Styles/main.min.css");
</style>
<!--[if lt IE 9]>
<script type="text/javascript" src="/kj/kx7/PublicHealth/SiteAssets/Scripts/dependencies.min.js"></script>
<![endif]-->

<script type="text/javascript" src="/kj/kx7/PublicHealth/SiteAssets/Scripts/markdown-it.min.js"></script>
<script type="text/javascript" src="/kj/kx7/PublicHealth/Pages/Dev/editor3.min.js"></script>
<script type="text/javascript" src="/kj/kx7/PublicHealth/SiteAssets/Scripts/main.min.js"></script>
