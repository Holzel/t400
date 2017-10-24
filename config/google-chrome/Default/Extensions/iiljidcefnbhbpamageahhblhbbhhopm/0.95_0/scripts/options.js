/*
	Copyright 2012
	Mike Chambers
	mikechambers@gmail.com

	http://www.mikechambers.com
*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global localStorage, document, chrome, setTimeout*/

(function () {

    "use strict";

    var usernameInput;
    var saveButton;
    var notificationsCB;
    var openInPopoutCB;
    var ignoreVodcastsCB;
      
    function save() {
         
        localStorage.accountName = usernameInput.value;
    
        localStorage.showNotifications = notificationsCB.checked;
        
        localStorage.openInPopout = openInPopoutCB.checked;

        localStorage.ignoreVodcasts = ignoreVodcastsCB.checked;

        
        var background = chrome.extension.getBackgroundPage();
        background.updateData();
    
    
        var status = document.getElementById("status");
        //status.innerHTML = "Options Saved.";
        status.style.opacity = 1;
        
        
        setTimeout(function () {
            //status.innerHTML = "";
            status.style.opacity = 0;
        }, 4000);
    }
    
    function init() {
        
        var accountName = localStorage.accountName;
        usernameInput = document.getElementById("username");
        
        if (accountName) {
            usernameInput.value = accountName;
        }
        
        notificationsCB = document.getElementById("showNotificationsCheck");
        var showNotifications = (localStorage.showNotifications === "true");
        
        if (showNotifications) {
            notificationsCB.checked = true;
        }
     
        openInPopoutCB = document.getElementById("openInPopoutCheck");
        var openInPopout = (localStorage.openInPopout === "true");
        
        if (openInPopout) {
            openInPopoutCB.checked = true;
        }
        
        ignoreVodcastsCB = document.getElementById("ignoreVodcastsCheck");
        var ignoreVodcasts = (localStorage.ignoreVodcasts === "true");
        
        if (ignoreVodcasts) {
            ignoreVodcastsCB.checked = true;
        }

        saveButton = document.getElementById("save-button");
        saveButton.onclick = save;
    }

    init();
}());