// @flow
export type ChooView = (state: Object, emit: Function) => HTMLElement;
export type ChooMiddleware = (state: Object, emitter: Object) => any;

const app = require("choo")();
const html = require("choo/html");
const eventNames = require("./eventNames");
const setupView = require("./views/app/setup");
const loginView = require("./views/app/login");
const homeView = require("./views/app/home");
const errorReducer = require("./reducers/error");
const chatReducer = require("./reducers/chat");
const setupReducer = require("./reducers/app/setup");
const serviceWorkerReducer = require("./reducers/app/serviceWorker");
const apiReducer = require("./reducers/app/api");
const userReducer = require("./reducers/app/user");

const notFoundView: ChooView = (state, emit) => {
    return html`<div>404 "${state.route}"</div>`;
};

const mainView = (state, emit) => {
    if (state.setup.permission !== "granted") {
        return setupView(state, emit);
    }
    if (!state.user.id) {
        if (state.params.room) {
            emit(state.events.CHAT_ROOM_UPDATE, JSON.parse(state.params.room));
        }
        const localUserId =
            state.params.userId || window.localStorage.getItem("userId");
        if (localUserId && !state.errors.api) {
            const saveLocallyValue = window.localStorage.getItem("saveLocally");
            const saveLocally = saveLocallyValue && saveLocallyValue === "yes";
            emit(state.events.USER_LOGIN, {
                username: localUserId,
                saveLocally
            });
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
