// @flow
import type { ChooMiddleware } from "./app";

const { apiCall } = require("./network");

const apiReducers: ChooMiddleware = (state, emitter) => {
    state.api = {};

    emitter.on(state.events.API_ROOM, () => {
        const query = `
        {
            room {
                apiKey
                sessionId
                token
            }
        }`;
        emitter.emit(state.events.CHAT_ROOM_UPDATE, "requesting");
        return apiCall({ query }, (err, resp, body) => {
            if (err || !body.data.room) {
                if (err) {
                    emitter.emit(state.events.ERROR_API, err);
                }
                return emitter.emit(
                    state.events.CHAT_ROOM_UPDATE,
                    "disconnected"
                );
            }
            const room = body.data.room;
            const publishFirst = false;
            return emitter.emit(state.events.CHAT_INIT, { room, publishFirst });
        });
    });
};

module.exports = apiReducers;
