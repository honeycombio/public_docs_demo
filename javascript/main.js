var App = window.App = {};

if (typeof Promise === "undefined") {
  window.Promise = require("es6-promise");
}
window.md5 = require("md5");

var accountURL;
if (process.env.NODE_ENV !== 'production') {
  App.uiBaseUrl = "http://localhost:8080";
} else {
  App.uiBaseUrl = "https://ui.honeycomb.io";
}

// Records visitors' UTM params & other site visit data on their first visit and
// most recent visit, so we can pass these details to poodle & understand
// who is visiting www and who is converting.
window.Cookies = require("js-cookie");
// For GDPR purposes, we need to ask users to explicitly consent to cookies use.
var consented = window.Cookies.get("hcCookies");
if (!consented) {
  document.getElementById("cookies-banner").style.display = "flex";
}

function getURLParam(name) {
  var query = window.location.search.substring(1);
  var pairs = query.split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    if (pair[0] == name) {
      return pair[1];
    }
  }
  return "";
}

var firstVisitCookieName = "utmsf";
var lastVisitCookieName = "utmsl";

var visitData = {
  t: (new Date()).getTime(),
  pg: window.location.href,
  ref: window.document.referrer,
  src: getURLParam("utm_source"),
  med: getURLParam("utm_medium"),
  cam: getURLParam("utm_campaign"),
  ter: getURLParam("utm_term"),
  con: getURLParam("utm_content")
};

var options = {
  expires: 365, // 1 year
  domain: window.location.hostname == "localhost" ? undefined : ".honeycomb.io"
};

// Only record this set of UTMs as the first visit if they don't have others set
if (!Cookies.get(firstVisitCookieName)) {
  Cookies.set(firstVisitCookieName, visitData, options);
}

// Always record the most recent set of UTM params as the last visit
Cookies.set(lastVisitCookieName, visitData, options);
