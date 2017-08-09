// @flow
import type { ChooMiddleware } from "./app";

const opentok = require("./opentok");

const chatReducer: ChooMiddleware = (state, emitter) => {
    state.chat = {
        room: null,
        publishFirst: false
    };

    emitter.on(state.events.CHAT_ROOM_UPDATE, room => {
        state.chat.room = room;
    });

    emitter.on(state.events.CHAT_INIT, ({ room, publishFirst }) => {
        state.chat.room = room;
        state.chat.publishFirst = publishFirst;
        opentok(state, emitter);
    });

    emitter.on(state.events.CHAT_ROOMSTATUS_UPDATE, status => {
        if (status !== "waiting" || state.chat.publishFirst) {
            return null;
        }
        return emitter.emit(state.events.API_NOTIFYGROUP, {
            groupId: state.params.groupId,
            room: state.chat.room
        });
    });
};

module.exports = chatReducer;
