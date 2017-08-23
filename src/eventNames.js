// @flow
import type { ChooMiddleware } from "./app";
const eventNames = {
    SETUP_PERMISSION_UPDATE: "setupp:notification:updated",

    WORKER_REGISTER: "worker:register",
    WORKER_REGISTERED: "worker:registered",
    WORKER_SERVERKEY: "worker:pushServer:key",
    WORKER_SUBSCRIPTION_INFO: "worker:subscription:info",
    WORKER_SUBSCRIBED: "worker:subscribed",

    ERROR_API: "error:api",

    API_ROOM: "api:room",
    API_PUSHSERVER_PUBKEY: "api:pushServer:pubKey",
    API_USER_UPDATE: "api:updateUser",
    API_NOTIFYGROUP: "api:notifyGroup",

    CHAT_ROOM_UPDATE: "chat:update",
    CHAT_SETTINGS_UPDATE: "chat:config:update",
    CHAT_INIT: "chat:init",
    CHAT_ROOMSTATUS_UPDATE: "chat:roomstatus:update",

    USER_LOGIN: "user:login",
    USER_LOGOUT: "user:logout",
    USER_UPDATED: "user:updated"
};

const events: ChooMiddleware = state => {
    Object.keys(eventNames).forEach(key => {
        state.events[key] = eventNames[key];
    });
};

module.exports = events;
