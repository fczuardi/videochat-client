// @flow
import type { ChooMiddleware } from "../app";
type RoomStatus = "disconnected" | "requesting" | "waiting" | "connected";

const extend = require("xtend");
const opentok = require("../opentok");

const chatReducer: ChooMiddleware = (state, emitter) => {
    state.chat = {
        room: null,
        roomSatus: "disconnected",
        session: null,
        settings: {
            voiceOnly: false,
            publishFirst: false
        }
    };

    emitter.on(state.events.CHAT_SETTINGS_UPDATE, update => {
        state.chat.settings = extend(state.chat.settings, update);
    });
    emitter.on(state.events.CHAT_ROOM_UPDATE, room => {
        state.chat.room = room;
    });

    emitter.on(state.events.CHAT_INIT, ({ room }) => {
        state.chat.room = room;
        state.session = opentok(state, emitter);
    });

    emitter.on(state.events.CHAT_ROOMSTATUS_UPDATE, status => {
        state.chat.roomStatus = status;

        if (status === "waiting") {
            emitter.emit(state.events.API_NOTIFYGROUP, {
                groupId: state.params.groupId,
                room: state.chat.room
            });
        }
        if (status === "disconnected") {
            state.chat.room = null;
            if (state.session) {
                state.session.disconnect();
            }
        }
        return emitter.emit(state.events.RENDER);
    });

    emitter.on(state.events.USER_LOGOUT, () => {
        state.chat.room = null;
        if (state.session) {
            state.session.disconnect();
        }
        emitter.emit(state.events.PUSHSTATE, "#home/");
    });
};

module.exports = chatReducer;
