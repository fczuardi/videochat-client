var onPush = function(pushEvent) {
    var data = pushEvent.data.json();
    pushEvent.waitUntil(
        self.registration.showNotification(data.title, data.options)
    );
};
self.addEventListener("push", onPush);

var onNotificationClick = function(event) {
    var room = event.notification.data;
    var encodedRoom = JSON.stringify(room);
    var baseUrl = self.registration.scope || './app.html';
    clients.openWindow(baseUrl + "#login/" + encodedRoom);
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
