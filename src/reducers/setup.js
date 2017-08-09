// @flow
import type { ChooMiddleware } from "../app";

const setup: ChooMiddleware = (state, emitter) => {
    state.setup = {
        permission: window.Notification.permission
    };
    emitter.on(state.events.SETUP_PERMISSION_UPDATE, permission => {
        state.setup.permission = permission;
        return emitter.emit(state.events.RENDER);
    });
};

module.exports = setup;
