var Store;
var chrome;
var settings = new Store("settings", {
    "language": "englisch-deutsch",
    "shortcutSpecialKey": "alt",
    "shortcutKey": "87" // 87 = W
}).toObject();
var onTranslate = function (info, tab) {
    chrome.tabs.sendMessage(tab.id, {
        "action": "launch-from-contextmenu",
        "settings": settings,
        "selectionText": info.selectionText
    });
};
var entry = null;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "init") {
        sendResponse(settings);
        if (!entry) {
            entry = chrome.contextMenus.create({
                "title": "Look up '%s'",
                "contexts": ["selection"],
                "onclick": onTranslate
            });
        }
    }
});
