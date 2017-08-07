// @flow
import type { ChooMiddleware } from "./app";

const notifications: ChooMiddleware = (state, emitter) => {
    (state.notifications = {
        permission: window.Notification.permission
    }), emitter.on("notification:update", permission => {
        state.notifications.permission = permission;
        if (permission === "denied") {
            return emitter.emit(state.events.RENDER);
        }
        emitter.emit("pushState", "#home");
    });
};

module.exports = notifications;
