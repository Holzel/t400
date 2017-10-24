var org;
(function (org) {
    var leo;
    (function (leo) {
        var dict;
        (function (dict) {
            var Widget = (function () {
                function Widget(settings, widgetID) {
                    if (widgetID === void 0) { widgetID = "__$$leodictwidget$$__"; }
                    var _this = this;
                    this.widgetID = widgetID;
                    this.settings = settings;
                    this.boundMoveObject = null;
                    window.addEventListener("mouseup", function (e) {
                        if (_this.widget()) {
                            if (_this.boundMoveObject) {
                                window.removeEventListener("mousemove", _this.boundMoveObject, true);
                                _this.boundMoveObject = null;
                            }
                            var query = window.getSelection().toString().trim();
                            if (query.length > 1) {
                                (_this.widget().childNodes[1]).src = _this.buildUrl(query);
                            }
                        }
                    }, false);
                    window.addEventListener("keydown", function (e) {
                        var specialKeyPressed = false;
                        switch (settings.shortcutSpecialKey) {
                            case "alt":
                                specialKeyPressed = e.altKey;
                                break;
                            case "shift":
                                specialKeyPressed = e.shiftKey;
                                break;
                            case "ctrl":
                                specialKeyPressed = e.ctrlKey;
                                break;
                            // Command Key on Mac
                            case "cmd-key":
                                var isMac = navigator.platform.toUpperCase().indexOf('MAC') != -1;
                                specialKeyPressed = e.metaKey && isMac;
                                break;
                        }
                        if (specialKeyPressed && e.keyCode == parseInt(settings.shortcutKey, 10)) {
                            if (_this.widget()) {
                                _this.hide();
                            }
                            else {
                                var query = window.getSelection().toString().trim();
                                _this.show(_this.buildUrl(query));
                            }
                        }
                    }, false);
                }
                Widget.prototype.widget = function () {
                    return document.getElementById(this.widgetID);
                };
                Widget.prototype.hide = function (e) {
                    if (typeof e !== "undefined") {
                        e.preventDefault();
                    }
                    if (this.widget()) {
                        this.widget().parentNode.removeChild(this.widget());
                    }
                };
                Widget.prototype.initWidgetMove = function (e) {
                    this.offX = e.clientX - this.widget().offsetLeft;
                    this.offY = e.clientY - this.widget().offsetTop;
                    this.boundMoveObject = this.widgetMove.bind(this);
                    window.addEventListener("mousemove", this.boundMoveObject, true);
                };
                Widget.prototype.widgetMove = function (e) {
                    if (this.widget()) {
                        this.widget().style.left = (e.clientX - this.offX) + "px";
                        this.widget().style.top = (e.clientY - this.offY) + "px";
                    }
                };
                Widget.prototype.buildUrl = function (query) {
                    var url = "https://pda.leo.org/" + this.settings.language + "/";
                    if (query.length > 1)
                        url += encodeURIComponent(query);
                    return url;
                };
                Widget.prototype.show = function (url) {
                    if (this.widget()) {
                        return;
                    }
                    var tmpwidget = document.createElement('div');
                    tmpwidget.setAttribute('id', this.widgetID);
                    tmpwidget.setAttribute('style', 'position:fixed; right:10px; top:10px; width:340px; height:520px; border:0; z-index:2147483647; box-shadow: -5px 5px 5px #CCC;');
                    var html = "<div style='width:100%; height: 20px; background-color:rgb(66, 185, 66); text-align:right; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none;";
                    html += "user-select: none; font-family: Arial, Verdana, sans-serif;padding:0;'>";
                    html += "<div style='float:right; background:#605F61; display:block; height:100%; padding: 0 3px; margin:0;line-height:0px;text-align:center;'>";
                    html += "<a style='text-decoration:none;color:#fff; display:block; font-size:25px; font-weight:bold; margin-top:8px;' href='#'>x</a></div></div>";
                    html += "<iframe style='width:100%; height:500px; border:0;' src='" + url + "'></iframe>";
                    html += "</div>";
                    tmpwidget.innerHTML = html;
                    document.body.appendChild(tmpwidget);
                    var dragborder = this.widget().childNodes[0];
                    dragborder.addEventListener("mousedown", this.initWidgetMove.bind(this), false);
                    var hidebtn = this.widget().getElementsByTagName("a")[0];
                    hidebtn.addEventListener("click", this.hide.bind(this), false);
                };
                return Widget;
            }());
            dict.Widget = Widget;
        })(dict = leo.dict || (leo.dict = {}));
    })(leo = org.leo || (org.leo = {}));
})(org || (org = {}));
/// <reference path="leodictwidget.ts" />
var widget = null;
var chrome;
chrome.runtime.sendMessage({ "action": "init" }, function (settings) {
    widget = new org.leo.dict.Widget(settings);
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "launch-from-contextmenu") {
        widget.show(widget.buildUrl(request.selectionText));
    }
});
