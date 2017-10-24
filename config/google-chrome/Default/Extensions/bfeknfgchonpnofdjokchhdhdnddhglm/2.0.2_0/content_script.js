'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StyleSwitcher = function () {
    function StyleSwitcher() {
        _classCallCheck(this, StyleSwitcher);

        this.head = document.getElementsByTagName('head')[0];
        this.link = document.createElement('link');

        this.link.id = 'dark-youtube-styles';
        this.link.rel = 'stylesheet';
        this.link.type = 'text/css';
        this.link.href = this.styleURL();
        this.link.media = 'screen';

        this.active = false;
    }

    _createClass(StyleSwitcher, [{
        key: 'activate',
        value: function activate() {
            if (this.active) {
                return;
            }

            this.active = true;
            this.head.appendChild(this.link);
        }
    }, {
        key: 'deactivate',
        value: function deactivate() {
            if (!this.active) {
                return;
            }

            this.active = false;
            this.head.removeChild(this.link);
        }
    }, {
        key: 'switch',
        value: function _switch(active) {
            if (active) {
                this.activate();
            } else {
                this.deactivate();
            }
        }
    }, {
        key: 'styleURL',
        value: function styleURL() {
            if (document.querySelector('ytd-app')) {
                return chrome.extension.getURL('styles.css');
            } else {
                return chrome.extension.getURL('legacy_styles.css');
            }
        }
    }]);

    return StyleSwitcher;
}();

var port = chrome.runtime.connect({ name: 'dark-youtube' });

var interval = setInterval(function () {
    if (document.querySelector('body > *')) {
        try {
            var styleSwitcher = new StyleSwitcher();

            port.onMessage.addListener(function (status) {
                if (typeof status.active !== 'undefined') {
                    styleSwitcher.switch(status.active);
                }
            });

            port.postMessage({ method: 'notifyActiveStatus', args: {} });
        } finally {
            clearInterval(interval);
        }
    }
}, 100);