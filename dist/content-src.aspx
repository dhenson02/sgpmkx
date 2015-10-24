<!DOCTYPE html>
<meta charset="UTF-8"/>
<style type="text/css">
@charset "UTF-8";
body { opacity: 0; }
body { opacity: 1; }
</style>
<title>Velocity Raptinators</title>
<div id="ph-root"></div>
<script type="text/javascript">
//<![CDATA[
	$(document.body).off("click").removeClass("ms-backgroundImage");
	$(window).off("click");
	$("form").off("submit");
	var	baseURL = _spPageContextInfo.webAbsoluteUrl,
		sitePath = baseURL + "/_api/lists/getByTitle('Content')",
		phCMCheckURL = _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups(419)/users/getById(" + _spPageContextInfo.userId + ")",
		phContext = "/Pages/" + _spPageContextInfo.serverRequestPath.split(/\//).pop().slice(0,-5),
		phLive = true,
		phEditorTheme = "base16-light",
		phOptionsURI = "/_api/lists/getByTitle('Options')/items/?$select=Variable,Value",
		phAddClass = ".loading",
		CodeMirror = null,
		leftNav = document.getElementById("leftnav"),
		s4Workspace = document.getElementById("s4-workspace"),
		phWrapper = document.createElement("div"),
        phWrapperTemp = document.getElementById("wrapper") || document.getElementById("ph-root") || document.querySelector(".tabs-wrapper + div"),
        phTabs = [
            {
                title: "Overview",
                icon: "home"
            },
            {
                title: "Policy",
                icon: "notebook"
            },
            {
                title: "Training",
                icon: "display1"
            },
            {
                title: "Resources",
                icon: "cloud-upload"
            },
            {
                title: "Tools",
                icon: "tools"
            },
            {
                title: "Contributions",
                icon: "users"
            }
        ];

    /* Get rid of the ugly nav on the left if it's there */
    if ( leftNav ) {
        leftNav.parentNode.removeChild(leftNav);
    }
    if ( s4Workspace ) {
        s4Workspace.removeAttribute("class");
        s4Workspace.removeAttribute("style");
        s4Workspace.removeAttribute("id");
    }

    phWrapper.id = "wrapper";
    if ( phWrapperTemp ) {
        phWrapperTemp.parentNode.replaceChild(phWrapper, phWrapperTemp);
    }
    else {
        document.body.appendChild(phWrapper);
    }
//]]>
</script>
<style type="text/css">
@import url("/kj/kx7/PublicHealth/Editor/editor.min.css");
@import url("/kj/kx7/PublicHealth/Editor/base16-light.css");
@import url("/kj/kx7/PublicHealth/SiteAssets/Styles/main.min.css");
</style>
<!--[if lt IE 9]>
<script type="text/javascript" src="/kj/kx7/PublicHealth/SiteAssets/Scripts/dependencies.min.js"></script>
<![endif]-->

<script type="text/javascript" src="/kj/kx7/PublicHealth/Editor/editor3.min.js"></script>
<script type="text/javascript" src="/kj/kx7/PublicHealth/SiteAssets/Scripts/main.min.js"></script>
