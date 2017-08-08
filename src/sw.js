var onPush = function(pushEvent) {
    console.log(pushEvent.data.text());
    var data = pushEvent.data.json();
    pushEvent.waitUntil(
        self.registration.showNotification(data.title, data.options)
    );
};
self.addEventListener("push", onPush);

var onNotificationClick = function(event) {
    console.log(event.type);
    console.log(event.action);
    console.log(event.notification);
    console.log(event.notification.data);
    console.log(event.notification.body);
};
self.addEventListener("notificationclick", onNotificationClick);

var onNotificationClose = function(event) {
    console.log("user dismissed");
};
self.addEventListener("notificationclose", onNotificationClose);

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
