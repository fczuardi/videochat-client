// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const html = require("choo/html");
const eventNames = require("./eventNames");
const notificationsReducer = require("./notifications");
const serviceWorkerReducer = require("./serviceWorker");
const apiReducer = require("./api.app");
const errorReducer = require("./error");
const userReducer = require("./user");
const chatReducer = require("./chat");
const setupView = require("./views/setup");
const loginView = require("./views/login");
const homeView = require("./views/home");

const mainView: ChooView = (state, emit) => {
    if (state.notifications.permission !== "granted") {
        return setupView(state, emit);
    }
    if (!state.user.id) {
        return loginView(state, emit);
    }
    return homeView(state, emit);
};


app.use(eventNames);
app.use(apiReducer);
app.use(errorReducer);
app.use(notificationsReducer);
app.use(serviceWorkerReducer);
app.use(userReducer);
app.use(chatReducer);
app.route("*", mainView);
app.route("#setup", setupView);
app.route("#home", homeView);

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(app.start());
