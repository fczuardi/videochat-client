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
        id: null
    }: User);

    emitter.on(state.events.USER_LOGIN, username => {
        state.user.username = username;
        emitter.emit(state.events.WORKER_REGISTER);
    });

    emitter.on(state.events.ERROR_API, () => emitter.emit(state.events.RENDER));

    emitter.on(state.events.USER_UPDATED, user => {
        state.user = extend(state.user, user);
        emitter.emit(state.events.RENDER);
    });
};

module.exports = userReducer;
