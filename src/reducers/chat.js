// @flow
import type { ChooMiddleware } from "../app";
type RoomStatus = "disconnected" | "requesting" | "waiting" | "connected";

const extend = require("xtend");
const opentok = require("../opentok");

const chatReducer: ChooMiddleware = (state, emitter) => {
    state.chat = {
        room: null,
        roomSatus: "disconnected",
        settings: {
            voiceOnly: false,
            publishFirst: false
        }
    };

    emitter.on(state.events.CHAT_SETTINGS_UPDATE, update => {
        state.chat.settings = extend(state.chat.settings, update);
    });
    emitter.on(state.events.CHAT_ROOMSTATUS_UPDATE, newStatus => {
        state.chat.roomStatus = newStatus;
        return emitter.emit(state.events.RENDER);
    });

    emitter.on(state.events.CHAT_ROOM_UPDATE, room => {
        state.chat.room = room;
    });

    emitter.on(state.events.CHAT_INIT, ({ room }) => {
        state.chat.room = room;
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
