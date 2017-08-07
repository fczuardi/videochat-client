// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const html = require("choo/html");
const notificationsReducer = require("./notifications");
const serviceWorkerReducer = require("./serviceWorker");
const apiReducers = require("./api.app");
const chatReducer = require("./chat");
const setupView = require("./views/setup");
const homeView = require("./views/home");

const mainView: ChooView = (state, emit) =>
    state.notifications.permission !== "granted"
        ? setupView(state, emit)
        : homeView(state, emit);

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
