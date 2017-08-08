// @flow
import type { ChooMiddleware } from "./app";
const eventNames = {
    ERROR_API: "error:api",

    API_ROOM: "api:room",
    API_PUSHSERVER_PUBKEY: "api:pushServer:pubKey",
    API_USER_UPDATE: "api:updateUser",

    CHAT_INIT: "chat:init",
    CHAT_ROOM_UPDATE: "chat:room:update",

    USER_LOGIN: "user:login",
    USER_UPDATED: "user:updated"
};

const events: ChooMiddleware = state => {
    Object.keys(eventNames).forEach(key => {
        state.events[key] = eventNames[key];
    });
};

module.exports = events;
