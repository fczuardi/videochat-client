// @flow
import type { ChooMiddleware } from "./app";
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
}

const extend = require('xtend');

const USER_LOGIN = "user:login";
const USER_UPDATED = "user:updated";

const userReducer: ChooMiddleware = (state, emitter) => {
    state.user = ({
        id: null
    }: User);

    state.events.USER_LOGIN = USER_LOGIN;
    state.events.USER_UPDATED = USER_UPDATED;

    emitter.on(state.events.USER_LOGIN, id => {
        state.user.id = id;
        emitter.emit(state.events.WORKER_REGISTER);
    });

    emitter.on(state.events.USER_UPDATED, user => {
        console.log({user});
        state.user = extend(state.user, user);
        emitter.emit(state.events.RENDER);
    });
};

module.exports = userReducer;
