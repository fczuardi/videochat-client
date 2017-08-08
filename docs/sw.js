var logSwEvent = function(event) {
    switch (event.type) {
        case "fetch":
            return console.log("fetch", event.request.url);
        default:
            return console.log(event.type);
    }
};

var onPush = function(event) {
    console.log("push event");
    console.log(push);
    const pushData = push.data;
    console.log({ pushData });
    const title = "foo";
    const options = {
        body: "bar"
    };
    const notification = new Notification(title, options);
    notification.addEventListener("click", function(event) {
        console.log("notification click event");
        console.log(event);
    });
};

self.addEventListener("push", onPush);

self.addEventListener("install", logSwEvent);
self.addEventListener("fetch", logSwEvent);
self.addEventListener("activate", logSwEvent);
self.addEventListener("notificationclose", logSwEvent);
self.addEventListener("notificationclick", logSwEvent);
