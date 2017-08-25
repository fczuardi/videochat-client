// @flow
import type { ChooMiddleware } from "../../app";
export type User = {
    id: string | null,
    name?: string,
    email?: string,
    groups?: string[],
    webPushInfo?: {
        endpoint: string,
        key: string,
        auth: string
    }
};

const extend = require("xtend");

const userReducer: ChooMiddleware = (state, emitter) => {
    state.user = ({
        username: null, // the input value on login form, before backend return of the id
        saveLocally: true,
        id: null
    }: User);

    emitter.on(state.events.USER_LOGIN, ({ username, saveLocally }) => {
        state.user.username = username;
        state.user.saveLocally = saveLocally;
        emitter.emit(state.events.WORKER_REGISTER);
    });

    emitter.on(state.events.USER_LOGOUT, () => {
        state.user.id = null;
        if (state.user.saveLocally) {
            window.localStorage.removeItem("userId");
        }
        emitter.emit(state.events.RENDER);
    });

    emitter.on(state.events.ERROR_API, () => emitter.emit(state.events.RENDER));

    emitter.on(state.events.USER_UPDATED, user => {
        state.user = extend(state.user, user);
        if (state.user.saveLocally) {
            window.localStorage.setItem("userId", state.user.id);
            window.localStorage.setItem("saveLocally", "yes");
        }

        emitter.emit(state.events.RENDER);
    });
};

module.exports = userReducer;
