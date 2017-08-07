// @flow
import type { ChooMiddleware } from "./app";

const USER_LOGIN = "user:login";

const userReducer: ChooMiddleware = (state, emitter) => {
    state.user = {
        id: null
    };

    state.events.USER_LOGIN = USER_LOGIN;

    emitter.on(state.events.USER_LOGIN, id => {
        state.user.id = id;
        emitter.emit(state.events.RENDER);
        emitter.emit(state.events.WORKER_REGISTER);
    });
};

module.exports = userReducer;
