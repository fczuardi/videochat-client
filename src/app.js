// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const log = require("choo-log");
const html = require("choo/html");
const setupView = require("./views/setup");
const homeView = require("./views/home");
const apiReducers = require("./network");
const notificationsReducer = require("./notifications");

const mainView: ChooView = (state, emit) =>
    state.notificationPermission !== "granted"
        ? setupView(state, emit)
        : homeView(state, emit);

// app.use(log());
app.use(apiReducers);
app.use(notificationsReducer);
app.route("*", mainView);
app.route("#setup", setupView);
app.route("#home", homeView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
