(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "http://localhost:4000/graphql/" } };
},{}],2:[function(require,module,exports){
//      


var _require = require("./network"),
    apiCall = _require.apiCall;

var API_PUSHSERVER_PUBKEY = "api:pushServer:pubKey";

var apiReducers = function (state, emitter) {
    state.api = {};
    state.events.API_PUSHSERVER_PUBKEY = API_PUSHSERVER_PUBKEY;

    emitter.on(state.events.API_PUSHSERVER_PUBKEY, function () {
        var query = "\n        {\n            pushServer {\n                pubKey\n            }\n        }";
        return apiCall({ query: query }, function (err, resp, body) {
            if (err || !body.data.pushServer) {
                if (err) {
                    console.error(err);
                }
                return console.error("API return dont have a pubkey value");
            }
            return emitter.emit(state.events.WORKER_SERVERKEY, body.data.pushServer.pubKey);
        });
    });
};

module.exports = apiReducers;
},{"./network":7}],3:[function(require,module,exports){
//      


var app = require("choo")();
var html = require("choo/html");
var notificationsReducer = require("./notifications");
var serviceWorkerReducer = require("./serviceWorker");
var apiReducers = require("./api.app");
var chatReducer = require("./chat");
var setupView = require("./views/setup");
var homeView = require("./views/home");

var mainView = function (state, emit) {
    return state.notifications.permission !== "granted" ? setupView(state, emit) : homeView(state, emit);
};

app.use(notificationsReducer);
app.use(serviceWorkerReducer);
app.use(apiReducers);
app.use(chatReducer);
app.route("*", mainView);
app.route("#setup", setupView);
app.route("#home", homeView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./api.app":2,"./chat":4,"./notifications":8,"./serviceWorker":10,"./views/home":12,"./views/setup":13,"choo":undefined,"choo/html":undefined}],4:[function(require,module,exports){
//      


var opentok = require("./opentok");

var chatReducer = function (state, emitter) {
    state.chat = {
        room: null
    };
    emitter.on("opentok:initialize", function (room) {
        state.chat.room = room;
        opentok(room, emitter, state.publishFirst);
    });
};

module.exports = chatReducer;
},{"./opentok":9}],5:[function(require,module,exports){
var config = require("../config.toml");
module.exports = config;
},{"../config.toml":1}],6:[function(require,module,exports){
module.exports = {
    setup: {
        title: "Setup",
        description: "Please allow notifications from this app.",
        continue: "Continue",
        permissionDenied: "You have denied the permission.",
        tryAgain: "Try Again"
    },
    loading: "please wait...",
    form: {
        name: "Name",
        email: "Email",
        signup: "Signup"
    },
    embed: {
        call: "Call"
    }
};
},{}],7:[function(require,module,exports){
//      


var xhr = require("xhr");
var config = require("./config");

var apiCall = function (body, cb) {
    return xhr({
        uri: config.api.url,
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        json: true,
        body: body
    }, cb);
};

module.exports = {
    apiCall: apiCall
};
},{"./config":5,"xhr":undefined}],8:[function(require,module,exports){
//      


var notifications = function (state, emitter) {
    state.notifications = {
        permission: window.Notification.permission
    }, emitter.on("notification:update", function (permission) {
        state.notifications.permission = permission;
        if (permission === "denied") {
            return emitter.emit(state.events.RENDER);
        }
        emitter.emit("pushState", "#home");
    });
};

module.exports = notifications;
},{}],9:[function(require,module,exports){
//      
var OT = require("@opentok/client");

var initializeSession = function (_ref, emitter) {
    var apiKey = _ref.apiKey,
        sessionId = _ref.sessionId,
        token = _ref.token;
    var publishFirst = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    emitter.emit("render");
    if (!apiKey || !sessionId || !token) {
        return;
    }
    var handleResponse = function (status) {
        return function (error) {
            if (error) {
                alert(error.message);
            }
            if (status) {
                emitter.emit("room:update", status);
            }
        };
    };
    var session = OT.initSession(apiKey, sessionId);
    //
    var initPublisher = function () {
        return OT.initPublisher("publisher", {
            insertMode: "append",
            width: "100%",
            height: "100%"
        }, handleResponse());
    };
    // Connect to the session
    session.connect(token, function (error) {
        // If the connection is successful, publish to the session
        if (error) {
            handleResponse()(error);
        } else {
            if (publishFirst) {
                session.publish(initPublisher(), handleResponse());
            }
            handleResponse("waiting")();
            // Subscribe to a newly created stream
            session.on("streamCreated", function (event) {
                // Create a publisher
                if (!publishFirst) {
                    session.publish(initPublisher(), handleResponse());
                }
                session.subscribe(event.stream, "subscriber", {
                    insertMode: "append",
                    width: "100%",
                    height: "100%"
                }, handleResponse("connected"));
            });
        }
    });
};

module.exports = initializeSession;
},{"@opentok/client":undefined}],10:[function(require,module,exports){
//      


var toUint8Array = require("./urlBase64ToUint8Array");

var WORKER_REGISTERED = "worker:registered";
var WORKER_SERVERKEY = "worker:pushServer:key";
var WORKER_SUBSCRIPTION_INFO = "worker:subscription:info";
var WORKER_SUBSCRIBED = "worker:subscribed";

var workerFilePath = "./sw.js";

var worker = function (state, emitter) {
    state.worker = {
        registration: null,
        subscription: null
    };

    state.events.WORKER_REGISTERED = WORKER_REGISTERED;
    state.events.WORKER_SERVERKEY = WORKER_SERVERKEY;
    state.events.WORKER_SUBSCRIPTION_INFO = WORKER_SUBSCRIPTION_INFO;
    state.events.WORKER_SUBSCRIBED = WORKER_SUBSCRIBED;

    emitter.on(state.events.WORKER_REGISTERED, function (registration) {
        state.worker.registration = registration;
        console.log({ registration: registration });
        // get push subscription
        return registration.pushManager.getSubscription().then(function (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIPTION_INFO, subscription);
        });
    });

    emitter.on(state.events.WORKER_SUBSCRIPTION_INFO, function (subscription) {
        if (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIBED, subscription);
        }
        console.log("eventName", state.events.API_PUSHSERVER_PUBKEY);
        return emitter.emit(state.events.API_PUSHSERVER_PUBKEY);
    });

    emitter.on(state.events.WORKER_SERVERKEY, function (serverKey) {
        console.log({ serverKey: serverKey });
        var options = {
            userVisibleOnly: true,
            applicationServerKey: toUint8Array(serverKey)
        };
        console.log({ options: options });
        return state.worker.registration.pushManager.subscribe(options).then(function (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIBED, subscription);
        });
    });

    emitter.on(state.events.WORKER_SUBSCRIBED, function (subscription) {
        console.log({ subscription: subscription });
        state.worker.subscription = subscription;
        emitter.emit(state.events.RENDER);
    });

    if (!navigator.serviceWorker) {
        return console.error("Browser doesnt have service worker support");
    }
    navigator.serviceWorker.register(workerFilePath).then(function (registration) {
        return emitter.emit(state.events.WORKER_REGISTERED, registration);
    }, console.error);
};

module.exports = worker;
},{"./urlBase64ToUint8Array":11}],11:[function(require,module,exports){
// from https://github.com/web-push-libs/web-push
function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
module.exports = urlBase64ToUint8Array;
},{}],12:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    <div id=\"publisher\"></div>\n    <div id=\"subscriber\"></div>\n    <form onsubmit=", ">\n        <textarea name=\"ot\"></textarea>\n        <input type=\"submit\" />\n    </form>\n</div>"], ["\n<div>\n    <div id=\"publisher\"></div>\n    <div id=\"subscriber\"></div>\n    <form onsubmit=", ">\n        <textarea name=\"ot\"></textarea>\n        <input type=\"submit\" />\n    </form>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");

var homeView = function (state, emit) {
    var onSubmit = function (event) {
        event.preventDefault();
        var room = JSON.parse(event.target.elements[0].value);
        state.publishFirst = true;
        emit("opentok:initialize", room);
    };
    return html(_templateObject, onSubmit);
};

module.exports = homeView;
},{"choo/html":undefined}],13:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    <p>", "</p>\n    <a href=\"#setup\">", "</a>\n</div>\n"], ["\n<div>\n    <p>", "</p>\n    <a href=\"#setup\">", "</a>\n</div>\n"]),
    _templateObject2 = _taggedTemplateLiteral(["\n<div>\n    <h2>", "</h2>\n    <p>", "</p>\n    <p>", "</p>\n    <button onclick=", " >\n        ", "\n    </button>\n</div>\n"], ["\n<div>\n    <h2>", "</h2>\n    <p>", "</p>\n    <p>", "</p>\n    <button onclick=", " >\n        ", "\n    </button>\n</div>\n"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../messages");

var permissionInfoView = function () {
    return html(_templateObject, messages.setup.permissionDenied, messages.back);
};

var setupView = function (state, emit) {
    var notificationPrompt = function () {
        return window.Notification.requestPermission().then(function (permission) {
            emit("notification:update", permission === "granted" ? permission : "denied");
        });
    };

    return html(_templateObject2, messages.setup.title, state.notifications.permission, state.notifications.permission !== "denied" ? messages.setup.description : messages.setup.permissionDenied, notificationPrompt, state.notifications.permission !== "denied" ? messages.setup.continue : messages.setup.tryAgain);
};

module.exports = setupView;
},{"../messages":6,"choo/html":undefined}]},{},[3]);
