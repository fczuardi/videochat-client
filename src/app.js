// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const html = require("choo/html");
const eventNames = require("./eventNames");
const setupReducer = require("./reducers/setup");
const serviceWorkerReducer = require("./reducers/serviceWorker");
const apiReducer = require("./api.app");
const errorReducer = require("./error");
const userReducer = require("./user");
const chatReducer = require("./reducers/chat");
const setupView = require("./views/app/setup");
const loginView = require("./views/app/login");
const homeView = require("./views/app/home");

const notFoundView: ChooView = (state, emit) => {
    return html`<div>404</div>`;
};

const mainView = (state, emit) => {
    if (state.setup.permission !== "granted") {
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
app.use(apiReducer);
app.use(errorReducer);
app.use(setupReducer);
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
