// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const log = require("choo-log");
const html = require("choo/html");
const setupView = require("./views/setup");
const homeView = require("./views/home");
const embedView = require("./views/embed");
const { apiReducers } = require("./network");

const notifications: ChooMiddleware = (state, emitter) => {
    (state.notificationPermission =
        window.Notification.permission), emitter.on(
        "notification:update",
        permission => {
            state.notificationPermission = permission;
            if (permission === "denied") {
                return emitter.emit("render");
            }
            emitter.emit("pushState", "#home");
        }
    );
};

const mainView: ChooView = (state, emit) =>
    state.notificationPermission !== "granted"
        ? setupView(state, emit)
        : homeView(state, emit);

// app.use(log());
app.use(notifications);
app.use(apiReducers);
app.route("*", mainView);
app.route("#setup", setupView);
app.route("#home", homeView);
app.route("#embed", embedView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
