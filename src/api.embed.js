// @flow
import type { ChooMiddleware } from "./app";

const {apiCall} = require('./network')

const apiReducers: ChooMiddleware = (state, emitter) => {
    state.api = {
    },
    emitter.on("api:room", () => {
        const query = `
        {
            room {
                apiKey
                sessionId
                token
            }
        }`;
        emitter.emit("room:update", "requesting");
        return apiCall({ query }, (err, resp, body) => {
            if (err || !body.data.room) {
                if (err) {
                    console.error(err);
                }
                return emitter.emit("room:update", "disconnected");
            }
            return emitter.emit("opentok:initialize", body.data.room);
        });
    });
};

module.exports = apiReducers;

