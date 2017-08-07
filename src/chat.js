// @flow
import type { ChooMiddleware } from "./app";

const opentok = require("./opentok");

const chatReducer: ChooMiddleware = (state, emitter) => {
    state.chat = {
        room: null
    };
    emitter.on("opentok:initialize", room => {
        state.chat.room = room;
        opentok(room, emitter, state.publishFirst);
    });
}

module.exports = chatReducer;
