// @flow
import type { ChooMiddleware } from "./app";

const notifications: ChooMiddleware = (state, emitter) => {
    state.notificationPermission = window.Notification.permission;
    emitter.on("notification:update", permission => {
        state.notificationPermission = permission;
        if (permission === "denied") {
            return emitter.emit(state.events.RENDER);
        }
        emitter.emit("pushState", "#home");
    });
};

module.exports = notifications;
