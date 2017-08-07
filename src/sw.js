var logSwEvent = function(event) {
    switch (event.type) {
        case "fetch":
            return console.log("fetch", event.request.url);
        default:
            return console.log(event.type);
    }
};

self.addEventListener("install", logSwEvent);
self.addEventListener("fetch", logSwEvent);
self.addEventListener("activate", logSwEvent);
self.addEventListener("push", logSwEvent);
self.addEventListener("notificationclose", logSwEvent);
self.addEventListener("notificationclick", logSwEvent);
