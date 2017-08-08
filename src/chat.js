// @flow
import type { ChooMiddleware } from "./app";

const opentok = require("./opentok");

const chatReducer: ChooMiddleware = (state, emitter) => {
    state.chat = {
        room: null,
        publishFirst: false
    };

    emitter.on(state.events.CHAT_INIT, ({room, publishFirst}) => {
        state.chat.room = room;
        state.publishFirst = publishFirst;
        opentok(state, emitter);
    });
};

module.exports = chatReducer;
