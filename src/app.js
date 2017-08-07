// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const html = require("choo/html");
// const apiReducers = require("./api.app");
const notificationsReducer = require("./notifications");
const chatReducers = require("./chat");
const setupView = require("./views/setup");
const homeView = require("./views/home");

const mainView: ChooView = (state, emit) =>
    state.notificationPermission !== "granted"
        ? setupView(state, emit)
        : homeView(state, emit);

// app.use(apiReducers);
app.use(notificationsReducer);
app.use(chatReducers);
app.route("*", mainView);
app.route("#setup", setupView);
app.route("#home", homeView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
