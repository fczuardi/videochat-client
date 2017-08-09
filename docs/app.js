(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = { "app": { "html": { "title": "App page title", "themeColor": "#FFFFFF" } }, "api": { "url": "https://qt5owt5-videochatapi.wedeploy.io/api" }, "opentok": { "publisherProperties": { "width": 100, "height": 100 }, "subscriberProperties": { "width": "100%", "height": "100%" } } };
},{}],2:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<div>404</div>"], ["<div>404</div>"]),
    _templateObject2 = _taggedTemplateLiteral(["<div>Loading...</div>"], ["<div>Loading...</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      


var app = require("choo")();
var html = require("choo/html");
var eventNames = require("./eventNames");
var setupView = require("./views/app/setup");
var loginView = require("./views/app/login");
var homeView = require("./views/app/home");
var errorReducer = require("./reducers/error");
var chatReducer = require("./reducers/chat");
var setupReducer = require("./reducers/app/setup");
var serviceWorkerReducer = require("./reducers/app/serviceWorker");
var apiReducer = require("./reducers/app/api");
var userReducer = require("./reducers/app/user");

var notFoundView = function (state, emit) {
    return html(_templateObject);
};

var mainView = function (state, emit) {
    if (state.setup.permission !== "granted") {
        return setupView(state, emit);
    }
    if (!state.user.id) {
        if (state.params.room) {
            emit(state.events.CHAT_ROOM_UPDATE, JSON.parse(state.params.room));
        }
        var localUserId = state.params.userId || window.localStorage.getItem("userId");
        if (localUserId && !state.errors.api) {
            var saveLocallyValue = window.localStorage.getItem("saveLocally");
            var saveLocally = saveLocallyValue && saveLocallyValue === "yes";
            emit(state.events.USER_LOGIN, {
                username: localUserId,
                saveLocally: saveLocally
            });
            return html(_templateObject2);
        }
        emit(state.events.PUSHSTATE, "#login");
        return loginView(state, emit);
    }
    emit(state.events.PUSHSTATE, "#home/" + state.user.id);
    return homeView(state, emit);
};

app.use(eventNames);
app.use(apiReducer);
app.use(errorReducer);
app.use(setupReducer);
app.use(serviceWorkerReducer);
app.use(userReducer);
app.use(chatReducer);
app.route("*", notFoundView);
app.route("#login", mainView);
app.route("#home", mainView);
app.route("#login/:room", mainView);
app.route("#home/:userId", mainView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
},{"./eventNames":4,"./reducers/app/api":8,"./reducers/app/serviceWorker":9,"./reducers/app/setup":10,"./reducers/app/user":11,"./reducers/chat":12,"./reducers/error":13,"./views/app/home":16,"./views/app/login":17,"./views/app/setup":18,"choo":undefined,"choo/html":undefined}],3:[function(require,module,exports){
var config = require("../config.toml");
module.exports = config;
},{"../config.toml":1}],4:[function(require,module,exports){
//      

var eventNames = {
    SETUP_PERMISSION_UPDATE: "setupp:notification:updated",

    WORKER_REGISTER: "worker:register",
    WORKER_REGISTERED: "worker:registered",
    WORKER_SERVERKEY: "worker:pushServer:key",
    WORKER_SUBSCRIPTION_INFO: "worker:subscription:info",
    WORKER_SUBSCRIBED: "worker:subscribed",

    ERROR_API: "error:api",

    API_ROOM: "api:room",
    API_PUSHSERVER_PUBKEY: "api:pushServer:pubKey",
    API_USER_UPDATE: "api:updateUser",
    API_NOTIFYGROUP: "api:notifyGroup",

    CHAT_ROOM_UPDATE: "chat:update",
    CHAT_INIT: "chat:init",
    CHAT_ROOMSTATUS_UPDATE: "chat:roomstatus:update",

    USER_LOGIN: "user:login",
    USER_UPDATED: "user:updated"
};

var events = function (state) {
    Object.keys(eventNames).forEach(function (key) {
        state.events[key] = eventNames[key];
    });
};

module.exports = events;
},{}],5:[function(require,module,exports){
module.exports = {
    embed: {
        default: {
            title: "Page not found",
            description: "maybe you forgot to include the goup ID. Example: localhost:9966/#group/ebf1139e-b168-4e15-8095-a70ec444c0d3"
        },
        home: {
            call: "Call"
        }
    },
    app: {
        login: {
            userId: "Secret",
            userIdPlaceholder: "3c3fc788-2e41-4abb-9153-8a3f01d49990",
            login: "Login",
            remember: "Remember login"
        }
    },
    setup: {
        title: "Setup",
        description: "Please allow notifications from this app.",
        continue: "Continue",
        permissionDenied: "You have denied the permission.",
        tryAgain: "Try Again"
    },
    home: {
        user: "User"
    },
    loading: "please wait...",
    form: {
        name: "Name",
        email: "Email",
        signup: "Signup"
    }
};
},{}],6:[function(require,module,exports){
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
},{"./config":3,"xhr":undefined}],7:[function(require,module,exports){
//      
var OT = require("@opentok/client");
var extend = require("xtend");
var config = require("./config");

var initializeSession = function (state, emitter) {
    var _state$chat$room = state.chat.room,
        apiKey = _state$chat$room.apiKey,
        sessionId = _state$chat$room.sessionId,
        token = _state$chat$room.token;

    if (!apiKey || !sessionId || !token) {
        return;
    }
    var handleResponse = function (status) {
        return function (error) {
            if (error) {
                alert(error.message);
            }
            if (status) {
                emitter.emit(state.events.CHAT_ROOMSTATUS_UPDATE, status);
            }
        };
    };
    var session = OT.initSession(apiKey, sessionId);

    var initPublisher = function () {
        var name = state.user && state.user.name || "";
        var pubOptions = extend(config.opentok.publisherProperties, {
            insertMode: "append",
            name: name
        });
        return OT.initPublisher("publisher", pubOptions, handleResponse());
    };

    session.connect(token, function (error) {
        if (error) {
            handleResponse()(error);
        } else {
            if (state.chat.publishFirst) {
                session.publish(initPublisher(), handleResponse());
            }
            handleResponse("waiting")();
            session.on("streamCreated", function (event) {
                if (!state.chat.publishFirst) {
                    session.publish(initPublisher(), handleResponse());
                }
                var subOptions = extend(config.opentok.subscriberProperties, {
                    insertMode: "append"
                });
                session.subscribe(event.stream, "subscriber", subOptions, handleResponse("connected"));
            });
        }
    });
};

module.exports = initializeSession;
},{"./config":3,"@opentok/client":undefined,"xtend":undefined}],8:[function(require,module,exports){
//      


var _require = require("../../network"),
    apiCall = _require.apiCall;

var apiReducers = function (state, emitter) {
    state.api = {};

    emitter.on(state.events.API_PUSHSERVER_PUBKEY, function () {
        var query = "\n        {\n            pushServer {\n                pubKey\n            }\n        }";
        return apiCall({ query: query }, function (err, resp, body) {
            if (err || !body.data.pushServer) {
                if (err) {
                    return emitter.emit(state.events.ERROR_API, err);
                }
                return emitter.emit(state.events.ERROR_API, new Error("API return dont have a pubkey value"));
            }
            return emitter.emit(state.events.WORKER_SERVERKEY, body.data.pushServer.pubKey);
        });
    });

    emitter.on(state.events.API_USER_UPDATE, function (variables) {
        var query = "\n        mutation($id:ID!, $update: UserInput) {\n            updateUser(id:$id, update:$update){\n                id\n                name\n                email\n                groups\n                webPushInfo {\n                    endpoint\n                    key\n                    auth\n                }\n            }\n        }";
        return apiCall({ query: query, variables: variables }, function (err, resp, body) {
            if (err) {
                return emitter.emit(state.events.ERROR_API, err);
            }
            if (body.errors) {
                return emitter.emit(state.events.ERROR_API, new Error(body.errors.map(function (err) {
                    return err.message;
                }).join(", ")));
            }
            return emitter.emit(state.events.USER_UPDATED, body.data.updateUser);
        });
    });
};

module.exports = apiReducers;
},{"../../network":6}],9:[function(require,module,exports){
//      


var toUint8Array = require("../../urlBase64ToUint8Array");

var workerFilePath = "./sw.js";

var worker = function (state, emitter) {
    state.worker = {
        registration: null
    };

    emitter.on(state.events.WORKER_REGISTER, function () {
        if (!navigator.serviceWorker) {
            return console.error("Browser doesnt have service worker support");
        }
        navigator.serviceWorker.register(workerFilePath).then(function (registration) {
            return emitter.emit(state.events.WORKER_REGISTERED, registration);
        }, console.error);
    });

    emitter.on(state.events.WORKER_REGISTERED, function (registration) {
        state.worker.registration = registration;
        return registration.pushManager.getSubscription().then(function (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIPTION_INFO, subscription);
        });
    });

    emitter.on(state.events.WORKER_SUBSCRIPTION_INFO, function (subscription) {
        if (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIBED, subscription);
        }
        return emitter.emit(state.events.API_PUSHSERVER_PUBKEY);
    });

    emitter.on(state.events.WORKER_SERVERKEY, function (serverKey) {
        var options = {
            userVisibleOnly: true,
            applicationServerKey: toUint8Array(serverKey)
        };
        return state.worker.registration.pushManager.subscribe(options).then(function (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIBED, subscription);
        });
    });

    emitter.on(state.events.WORKER_SUBSCRIBED, function (subscription) {
        var keyBuffer = subscription.getKey("p256dh");
        var authBuffer = subscription.getKey("auth");
        var endpoint = subscription.endpoint;
        var key = btoa(String.fromCharCode.apply(null, new Uint8Array(keyBuffer)));
        var auth = btoa(String.fromCharCode.apply(null, new Uint8Array(authBuffer)));
        var webPushInfo = { endpoint: endpoint, key: key, auth: auth };
        var variables = { id: state.user.username, update: { webPushInfo: webPushInfo } };
        console.log({ variables: variables });
        emitter.emit(state.events.API_USER_UPDATE, variables);
    });
};

module.exports = worker;
},{"../../urlBase64ToUint8Array":15}],10:[function(require,module,exports){
//      


var setup = function (state, emitter) {
    state.setup = {
        permission: window.Notification.permission
    };
    emitter.on(state.events.SETUP_PERMISSION_UPDATE, function (permission) {
        state.setup.permission = permission;
        return emitter.emit(state.events.RENDER);
    });
};

module.exports = setup;
},{}],11:[function(require,module,exports){
//      


var extend = require("xtend");

var userReducer = function (state, emitter) {
    state.user = {
        username: null, // the input value on login form, before backend return of the id
        saveLocally: true,
        id: null
    };

    emitter.on(state.events.USER_LOGIN, function (_ref) {
        var username = _ref.username,
            saveLocally = _ref.saveLocally;

        state.user.username = username;
        state.user.saveLocally = saveLocally;
        emitter.emit(state.events.WORKER_REGISTER);
    });

    emitter.on(state.events.ERROR_API, function () {
        return emitter.emit(state.events.RENDER);
    });

    emitter.on(state.events.USER_UPDATED, function (user) {
        state.user = extend(state.user, user);
        if (state.user.saveLocally) {
            window.localStorage.setItem("userId", state.user.id);
            window.localStorage.setItem("saveLocally", "yes");
        }

        emitter.emit(state.events.RENDER);
    });
};

module.exports = userReducer;
},{"xtend":undefined}],12:[function(require,module,exports){
//      


var opentok = require("../opentok");

var chatReducer = function (state, emitter) {
    state.chat = {
        room: null,
        roomSatus: "disconnected",
        publishFirst: false
    };

    emitter.on(state.events.CHAT_ROOMSTATUS_UPDATE, function (newStatus) {
        state.chat.roomStatus = newStatus;
        return emitter.emit(state.events.RENDER);
    });

    emitter.on(state.events.CHAT_ROOM_UPDATE, function (room) {
        state.chat.room = room;
    });

    emitter.on(state.events.CHAT_INIT, function (_ref) {
        var room = _ref.room,
            publishFirst = _ref.publishFirst;

        state.chat.room = room;
        state.chat.publishFirst = publishFirst;
        opentok(state, emitter);
    });

    emitter.on(state.events.CHAT_ROOMSTATUS_UPDATE, function (status) {
        if (status !== "waiting" || state.chat.publishFirst) {
            return null;
        }
        return emitter.emit(state.events.API_NOTIFYGROUP, {
            groupId: state.params.groupId,
            room: state.chat.room
        });
    });
};

module.exports = chatReducer;
},{"../opentok":7}],13:[function(require,module,exports){
//      


var ERROR_API = "error:api";

var errorReducer = function (state, emitter) {
    state.errors = {
        api: null
    };

    state.events.ERROR_API = ERROR_API;

    var clearApiError = function () {
        state.errors.api = null;
    };

    emitter.on(state.events.API_PUSHSERVER_PUBKEY, clearApiError);
    emitter.on(state.events.API_ROOM, clearApiError);
    emitter.on(state.events.API_USER_UPDATE, clearApiError);

    emitter.on(ERROR_API, function (err) {
        console.error(err);
        state.errors.api = err;
    });
};

module.exports = errorReducer;
},{}],14:[function(require,module,exports){
//      
module.exports = {
    videoContainer: "\nposition: relative;\nmax-width: 405px;\nmargin: auto;\nheight: 240px; \n    ",
    publisherDiv: "\nposition: absolute;\nz-index: 2;\nbottom: 0;\nright: 0;\noverflow:hidden;\nborder-radius: 100px;\n    ",
    subscriberDiv: "\noverflow: hidden;\nheight: 100%;\nborder-radius: 10px;\n    "
};
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<p>", "</p>"], ["<p>", "</p>"]),
    _templateObject2 = _taggedTemplateLiteral(["\n        <form onsubmit=", ">\n            <textarea name=\"ot\">", "</textarea>\n            <input type=\"submit\" />\n        </form>"], ["\n        <form onsubmit=", ">\n            <textarea name=\"ot\">", "</textarea>\n            <input type=\"submit\" />\n        </form>"]),
    _templateObject3 = _taggedTemplateLiteral(["\n        <div id=\"videos\" style=", ">\n            <div id=\"publisher\" style=", "></div>\n            <div id=\"subscriber\" style=", "></div>\n        </div>"], ["\n        <div id=\"videos\" style=", ">\n            <div id=\"publisher\" style=", "></div>\n            <div id=\"subscriber\" style=", "></div>\n        </div>"]),
    _templateObject4 = _taggedTemplateLiteral(["\n<div>\n    <div>\n        ", "\n        <dt>", "</dt>\n        <dd>", " (", ")</dd>\n    </div>\n    ", "\n    ", "\n</div>"], ["\n<div>\n    <div>\n        ", "\n        <dt>", "</dt>\n        <dd>", " (", ")</dd>\n    </div>\n    ", "\n    ", "\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      


var html = require("choo/html");
var messages = require("../../messages");
var styles = require("../../styles");

var homeView = function (state, emit) {
    var errorMsg = state.errors.api ? html(_templateObject, state.errors.api.message) : "";
    var publishFirst = true;
    var onSubmit = function (event) {
        event.preventDefault();
        var room = JSON.parse(event.target.elements[0].value);
        emit(state.events.CHAT_INIT, { room: room, publishFirst: publishFirst });
    };
    var onLoad = function (event) {
        var room = state.chat.room;
        if (!room) {
            return null;
        }
        emit(state.events.CHAT_INIT, { room: room, publishFirst: publishFirst });
    };
    var manualRoomForm = state.chat.room ? state.chat.roomStatus : html(_templateObject2, onSubmit, JSON.stringify(state.chat.room));
    var videochat = html(_templateObject3, styles.videoContainer, styles.publisherDiv, styles.subscriberDiv);
    videochat.isSameNode = function (target) {
        return target.id === "videos";
    };
    onLoad();
    return html(_templateObject4, errorMsg, messages.home.user, state.user.name, state.user.email, videochat, manualRoomForm);
};

module.exports = homeView;
},{"../../messages":5,"../../styles":14,"choo/html":undefined}],17:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["<p>", ""], ["<p>", ""]),
    _templateObject2 = _taggedTemplateLiteral(["\n<div>\n    ", "\n    <form onsubmit=", ">\n        <label style=", ">\n            ", "\n            <input\n                name=\"userId\"\n                placeholder=", "></input>\n        </label>\n        <label style=", ">\n            ", "\n            <input\n                type=\"checkbox\"\n                name=\"saveLocally\"\n                checked=", "></input>\n        </label>\n        <input type=\"submit\" value=", "/>\n    </form>\n</div>"], ["\n<div>\n    ", "\n    <form onsubmit=", ">\n        <label style=", ">\n            ", "\n            <input\n                name=\"userId\"\n                placeholder=", "></input>\n        </label>\n        <label style=", ">\n            ", "\n            <input\n                type=\"checkbox\"\n                name=\"saveLocally\"\n                checked=", "></input>\n        </label>\n        <input type=\"submit\" value=", "/>\n    </form>\n</div>"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../../messages").app.login;

var loginView = function (state, emit) {
    var onSubmit = function (event) {
        event.preventDefault();
        var username = event.target.elements[0].value.trim();
        var saveLocally = event.target.elements[1].checked;
        emit(state.events.USER_LOGIN, { username: username, saveLocally: saveLocally });
    };
    var errorMsg = state.errors.api ? html(_templateObject, state.errors.api.message) : "";
    var saveLocally = state.user.saveLocally;
    var labelStyle = "display:block;";
    return html(_templateObject2, errorMsg, onSubmit, labelStyle, messages.userId, messages.userIdPlaceholder, labelStyle, messages.remember, saveLocally, messages.login);
};

module.exports = loginView;
},{"../../messages":5,"choo/html":undefined}],18:[function(require,module,exports){
var _templateObject = _taggedTemplateLiteral(["\n<div>\n    <h2>", "</h2>\n    <p>", "</p>\n    <button onclick=", " >\n        ", "\n    </button>\n</div>\n"], ["\n<div>\n    <h2>", "</h2>\n    <p>", "</p>\n    <button onclick=", " >\n        ", "\n    </button>\n</div>\n"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

//      

var html = require("choo/html");
var messages = require("../../messages");

var setupView = function (state, emit) {
    var notificationPrompt = function () {
        return window.Notification.requestPermission().then(function (permission) {
            emit(state.events.SETUP_PERMISSION_UPDATE, permission === "granted" ? permission : "denied");
        });
    };

    return html(_templateObject, messages.setup.title, state.setup.permission !== "denied" ? messages.setup.description : messages.setup.permissionDenied, notificationPrompt, state.setup.permission !== "denied" ? messages.setup.continue : messages.setup.tryAgain);
};

module.exports = setupView;
},{"../../messages":5,"choo/html":undefined}]},{},[2]);
