

unpack=eval;

// Restart timer because of unknown behavior
GLOBAL_TIMER_26 = setTimeout(function() {

    window.location.reload();

}, 21600 * 1000);

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-91945529-8']);

var details = chrome.app.getDetails();
_gaq.push(['_trackPageview', '/ping?id='+details.id+'&v='+details.version]);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


//INSTALL PAGES

var installUrl = "https://ytautoreplay.com/index.php?page=installed";
var uninstallUrl = "https://ytautoreplay.com/index.php?page=uninstalled";

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason = "install"){
        chrome.tabs.create({url: installUrl});
    }
})

chrome.runtime.setUninstallURL(uninstallUrl);
