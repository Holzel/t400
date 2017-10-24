/*
	Copyright 2012
	Mike Chambers
	mikechambers@gmail.com

	http://www.mikechambers.com
*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global localStorage, window, $, webkitNotifications, chrome */

//check text status, when there is a timeout, add additional delay


(function () {

    "use strict";
    
    var LIMIT_AMOUNT = 100;
    var AJAX_TIMEOUT = 1000 * 30; //30 seconds
	var CLIENT_ID = "haeyonp05j4wiphav3eppivtdsvlyoq";

    var DATA_URL = "https://api.twitch.tv/kraken/users/{0}/follows/channels?limit=" + LIMIT_AMOUNT + "&offset={1}&client_id=" + CLIENT_ID;
   
    var lastAjaxRequest;
    
    var UPDATE_INTERVAL = 60 * 1000 * 2;//2 minutes
    
    var ACCOUNT_NAME_KEY = "accountName";
    
    var offset = 0;
    
    var intervalId;
    
    var streams;
    var channels;
    
    var popup;
    
    var errorMessage;
    var accountName;
    
    var oldStreams;
    var notification = "";
    
    function updateBadge(text, color) {
        chrome.browserAction.setBadgeBackgroundColor({color: color});
        chrome.browserAction.setBadgeText({"text": text});
    }
    
    function onStorageUpdate(e) {
        if (e.key === ACCOUNT_NAME_KEY) {
            accountName = e.newValue;
        }
    }
    
    function getStreams() {
        return streams;
    }
    
    function getErrorMessage() {
        return errorMessage;
    }
    
    function setPopup(p) {
        popup = p;
    }
    
    function getNewStreams() {
        if (!oldStreams) {
            return false;
        }
        
        var hash = {};
        var len = oldStreams.length;
        
        var i;
        for (i = 0; i < len; i++) {
            //todo: channel.channel?
            hash[oldStreams[i].channel.name] = true;
        }
        
        len = streams.length;
        
        var nStreams = [];
        var login;
        var stream;
        for (i = 0; i < len; i++) {
            stream = streams[i];
            login = stream.channel.name;
            if (!hash.hasOwnProperty(login)) {
                nStreams.push({name: login, game: stream.game});
            }
        }
        
        return nStreams;
    }
    
    function broadcastError(msg) {
        errorMessage = msg;
        if (popup) {
            popup.setErrorMessage(msg);
        }
        
        if (msg) {
            chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
            chrome.browserAction.setBadgeText({"text": "?"});
        }
    }
    
    function notificationCreationCallback(notificationId) {
        notification = notificationId;
    }
    
    function onUserStreamInfoLoad(rawData) {
        lastAjaxRequest = null;
        errorMessage = null;
        
        oldStreams = streams;
        streams = rawData;
        
        streams = streams.streams;


        //check if we need to filter out vodcasts
        if(localStorage.ignoreVodcasts === "true") {
            var sLen = streams.length;
            for(var i = sLen - 1; i > -1; i--) {
                var s = streams[i];

                if(s.stream_type == "watch_party") {
                    streams.splice(i, 1);
                }
            }
        }

        var nStreams = getNewStreams();
        
        //check if there are new streams
        var newStreamLen = nStreams.length;
        if (newStreamLen) {
            
            //check if notifications are enabled
            if ((localStorage.showNotifications === "true")) {
                
                var options = {
                    title : "Twitch Live",
                    priority : 0,
                    iconUrl : chrome.runtime.getURL("images/notification-64x64.png")
                };
                
                var i;
                if (newStreamLen <= 5) {
                    options.type = "list";
                    options.message = "New Twitch.tv streams online!";
                    
                    var items = [];
                    var s;
                    for (i = 0; i < newStreamLen; i++) {
                        s = nStreams[i];
                        
                        items.push({title: s.name, message: "is playing " + s.game});
                    }
                    
                    options.items = items;
                } else {
                    options.type = "basic";
                    options.message = "New Twitch.tv streams online:\n";
                    
                    for (i = 0; i < newStreamLen; i++) {
                        options.message += nStreams[i].name + ", ";
                    }
                    
                    //remove trailing comma
                    options.message = options.message.replace(/, +$/, "");
                }
                
                chrome.notifications.create("", options, notificationCreationCallback);
            }
        }
        
        var len = streams.length;
        
        var badgeColor = [0, 0, 255, 255];
        var badgeText = String(len);
        
        updateBadge(badgeText, badgeColor);
        
        if (popup) {
            //broadcastError(null);
            popup.updateView();
        }
        
        channels = null;
    }
    
    
    //503 : unavailable
    //408 : timeout
    function onUserStreamInfoError(XMLHttpRequest, textStatus, errorThrown) {
        lastAjaxRequest = null;
        //broadcastError("Error loading stream data from Twitch.tv");
        console.log("------------------------Error Loading Data-------------------------------------");
        console.log("onUserStreamInfoError : " + XMLHttpRequest.responseText);
        console.log("Time : " + new Date().toString());
        console.log("XMLHttpRequest :", XMLHttpRequest);
        console.log("textStatus :", textStatus);
        console.log("errorThrown :", errorThrown);
        console.log("------------------------------End Error----------------------------------------");
    }
    
    function onUserDataError(XMLHttpRequest, textStatus, errorThrown) {
        lastAjaxRequest = null;
        //broadcastError("Error loading user data from Twitch.tv");
        console.log("------------------------Error Loading Data-------------------------------------");
        console.log("Error : onUserDataError");
        console.log("Time : " + new Date().toString());
        console.log("XMLHttpRequest :", XMLHttpRequest);
        console.log("textStatus :", textStatus);
        console.log("errorThrown :", errorThrown);
        console.log("------------------------------End Error----------------------------------------");
    }
    
    function parseChannels() {
        var len = channels.length;

        var loginNameParams = [];
        
        var i;
        for (i = 0; i < len; i++) {
            var channel = channels[i];
            loginNameParams.push(channel.channel.name);
        }

        lastAjaxRequest = $.ajax({
            type: "GET",
            //dataType: "text",
            timeout: AJAX_TIMEOUT,
            cache: false,
            dataType: "json",
            url: "https://api.twitch.tv/kraken/streams?channel=" + encodeURI(loginNameParams.toString()) + "&client_id=" + CLIENT_ID + "&limit=100"
            //url: "https://api.twitch.tv/kraken/streams/" + encodeURI(loginNameParams.toString()) + "?client_id=" + CLIENT_ID


            //success: onUserStreamInfoLoad,
            //error: onUserStreamInfoError
        });
        lastAjaxRequest.done(onUserStreamInfoLoad);
        lastAjaxRequest.fail(onUserStreamInfoError);
    }
    
    var loadAccountInfo;
    function onLoadAccountInfo(rawData) {

        lastAjaxRequest = null;
        
        offset += LIMIT_AMOUNT;
        
        //var tmp = JSON.parse(rawData);
        var tmp = rawData;
        //todo: could give an error if nothing is returned
        tmp = tmp.follows;
        
        if (!channels) {
            console.log("onLoadAccountInfo : channels was null");
            return;
        }

        if (!tmp.length && !channels.length) {
            return;
        }
        
        //todo: check for better way to do this
        channels = channels.concat(tmp);
        
        if (tmp.length === 0) {

            parseChannels();
        } else {
        
            //this is probably redundant (see above)
            /*
            if (!channels.length) {
                return;
            }
            */

            loadAccountInfo();
        }
    }
    
    loadAccountInfo = function () {
        
        var url = DATA_URL.replace("{0}", encodeURI(accountName)).replace("{1}", offset);

        lastAjaxRequest = $.ajax({
            type: "GET",
            timeout: AJAX_TIMEOUT,
            //dataType: "text",
            dataType: "json",
            url: url,
            cache: false
            //success: onLoadAccountInfo,
            //error: onUserDataError
        });
    
        lastAjaxRequest.done(onLoadAccountInfo);
        lastAjaxRequest.fail(onUserDataError);
    };
    
    var updateData;
    function onInterval() {
        updateData();
    }
    
    updateData = function () {
                
        if (!accountName) {
            updateBadge("", [0, 0, 0, 0]);
            return;
        }
        
        if (intervalId) {
            window.clearTimeout(intervalId);
        }
        
        if (lastAjaxRequest) {
            lastAjaxRequest.abort();
            lastAjaxRequest = null;
        }
        
        intervalId = window.setTimeout(onInterval, UPDATE_INTERVAL);

        offset = 0;
        
        //todo: need to store old ones in case you try to open when loading
        channels = [];
        loadAccountInfo();
    };
    
    function init() {
                
        updateBadge("", [0, 0, 0, 0]);
        
        accountName = localStorage[ACCOUNT_NAME_KEY];
        window.addEventListener("storage", onStorageUpdate);
        
        updateData();
    }
    
    window.setPopup = setPopup;
    window.getErrorMessage = getErrorMessage;
    window.getStreams = getStreams;
    //window.getChannels = getChannels;
    window.updateData = updateData;

    init();
}());