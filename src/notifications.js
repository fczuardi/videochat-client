// @flow
import type { ChooMiddleware } from "./app";

const notifications: ChooMiddleware = (state, emitter) => {
    state.notifications = {
        permission: window.Notification.permission
    };
    emitter.on("notification:update", permission => {
        state.notifications.permission = permission;
        return emitter.emit(state.events.RENDER);
    });
};

module.exports = notifications;
