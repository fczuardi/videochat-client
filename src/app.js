// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const html = require("choo/html");
const eventNames = require("./eventNames");
const notificationsReducer = require("./notifications");
const serviceWorkerReducer = require("./serviceWorker");
const uiReducer = require("./ui.embed");
const apiReducer = require("./api.app");
const errorReducer = require("./error");
const userReducer = require("./user");
const chatReducer = require("./chat");
const setupView = require("./views/setup");
const loginView = require("./views/login");
const homeView = require("./views/home");

const notFoundView: ChooView = (state, emit) => {
    return html`<div>404</div>`;
};

const mainView = (state, emit) => {
    if (state.notifications.permission !== "granted") {
        return setupView(state, emit);
    }
    if (!state.user.id) {
        if (state.params.userId) {
            emit(state.events.USER_LOGIN, state.params.userId);
            return html`<div>Loading...</div>`;
        }
        emit(state.events.PUSHSTATE, "#login");
        return loginView(state, emit);
    }
    emit(state.events.PUSHSTATE, `#home/${state.user.id}`);
    return homeView(state, emit);
};

app.use(eventNames);
app.use(uiReducer);
app.use(apiReducer);
app.use(errorReducer);
app.use(notificationsReducer);
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
