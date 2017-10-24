'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConfigStore = function () {
    function ConfigStore() {
        _classCallCheck(this, ConfigStore);
    }

    _createClass(ConfigStore, [{
        key: 'defaults',
        value: function defaults() {
            return {
                active: true
            };
        }
    }, {
        key: 'get',
        value: function get() {
            var config = localStorage.getItem('youtube_skin');

            if (!config) {
                return this.defaults();
            }

            return JSON.parse(config);
        }
    }, {
        key: 'set',
        value: function set(config) {
            var current = this.get();

            Object.keys(config).forEach(function (key) {
                current[key] = config[key];
            });

            this.replace(config);
        }
    }, {
        key: 'replace',
        value: function replace(config) {
            localStorage.setItem('youtube_skin', JSON.stringify(config));
        }
    }]);

    return ConfigStore;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controller = function () {
    function Controller(configStore) {
        var _this = this;

        _classCallCheck(this, Controller);

        this.config = configStore;
        this.listener = function () {};

        this.accessibleMethods = {
            notifyActiveStatus: function notifyActiveStatus() {
                return _this.listener(_this.config.get());
            }
        };
    }

    _createClass(Controller, [{
        key: "callMethod",
        value: function callMethod(method, args) {
            var _accessibleMethods;

            if (!this.accessibleMethods[method]) {
                return;
            }

            return (_accessibleMethods = this.accessibleMethods)[method].apply(_accessibleMethods, _toConsumableArray(args));
        }
    }, {
        key: "onUpdate",
        value: function onUpdate(listener) {
            this.listener = listener;
            this.listener(this.config.get());
        }
    }, {
        key: "isActive",
        value: function isActive() {
            return this.config.get().active;
        }
    }, {
        key: "updateActive",
        value: function updateActive(active) {
            this.config.set({ active: active });
            this.listener(this.config.get());
        }
    }, {
        key: "toggleActive",
        value: function toggleActive() {
            this.updateActive(!this.isActive());
        }
    }]);

    return Controller;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Messenger = function () {
    function Messenger(runtime) {
        var _this = this;

        _classCallCheck(this, Messenger);

        this.runtime = runtime;
        this.listener = function () {};
        this.ports = [];

        this.runtime.onConnect.addListener(function (port) {
            return _this.handleConnect(port);
        });
    }

    _createClass(Messenger, [{
        key: 'onMessage',
        value: function onMessage(listener) {
            this.listener = listener;
        }
    }, {
        key: 'handleConnect',
        value: function handleConnect(port) {
            var _this2 = this;

            if (port.name !== 'dark-youtube') {
                return;
            }

            this.ports.push(port);

            port.onMessage.addListener(function (request) {
                return _this2.listener(request);
            });
            port.onDisconnect.addListener(function () {
                return _this2.removePort(port);
            });
        }
    }, {
        key: 'removePort',
        value: function removePort(port) {
            this.ports.splice(this.ports.indexOf(port), 1);
        }
    }, {
        key: 'notify',
        value: function notify(message) {
            this.ports.forEach(function (port) {
                try {
                    port.postMessage(message);
                } catch (e) {
                    console.error('Could not send message to port', e);
                }
            });
        }
    }]);

    return Messenger;
}();
'use strict';

var configStore = new ConfigStore(),
    messenger = new Messenger(chrome.runtime),
    controller = new Controller(configStore, messenger);

messenger.onMessage(function (request) {
    controller.callMethod(request.method, request.arguments || {});
});

chrome.browserAction.onClicked.addListener(function () {
    return controller.toggleActive();
});

controller.onUpdate(function (config) {
    var icon = config.active ? 'images/black_youtube_19.png' : 'images/white_youtube_19.png';

    chrome.browserAction.setIcon({ path: icon });

    messenger.notify({ active: controller.isActive() });
});