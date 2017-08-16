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
const mdlReducer = require("./reducers/app/mdl");
const chatReducer = require("./reducers/chat");
const setupReducer = require("./reducers/app/setup");
const serviceWorkerReducer = require("./reducers/app/serviceWorker");
const apiReducer = require("./reducers/app/api");
const userReducer = require("./reducers/app/user");

const styleLib = html`
<div>
    <link
        rel="stylesheet"
        href="https://code.getmdl.io/1.3.0/material.blue_grey-indigo.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <script src="https://code.getmdl.io/1.3.0/material.min.js"></script>
</div>
`;

const snackbar = html`
<div class="mdl-snackbar mdl-js-snackbar">
    <div class="mdl-snackbar__text"></div>
    <button type="button" class="mdl-snackbar__action"></button>
</div>
`;

const viewContainer = html`
<div class="mdl-layout mdl-js-layout">
    <main class="mdl-layout__content">
        <div class="mdl-grid">
            <div class="mdl-cell mdl-cell--hide-phone mdl-cell--2-col-tablet mdl-cell--4-col "></div>
            <div class="mdl-cell mdl-cell--4-col">
                <div id="root"></div>
            </div>
        </div>
    </main>
    ${snackbar}
</div>
`;

const rootContainer = html`
<div>
    ${styleLib}
    ${viewContainer}
</div>
`;

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
app.use(errorReducer(snackbar));
app.use(setupReducer);
app.use(serviceWorkerReducer);
app.use(userReducer);
app.use(chatReducer);
app.use(mdlReducer);
app.route("/videochat-client/app.html/login/:room", mainView);
app.route("/videochat-client/app.html/login", mainView);
app.route("/login/:room", mainView);
app.route("/login", mainView);
app.route("/videochat-client/app.html/home/:userId", mainView);
app.route("/videochat-client/app.html/home", mainView);
app.route("/home/:userId", mainView);
app.route("/home", mainView);
app.route("/videochat-client/app.html", mainView);
app.route("/", mainView);
app.route("*", notFoundView);
app.mount("#root");

if (typeof document === "undefined" || !document.body) {
    throw new Error("document.body is not here");
}
document.body.appendChild(rootContainer);
