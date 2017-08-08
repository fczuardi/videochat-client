// @flow
import type { ChooMiddleware } from "./app";

type RoomStatus = "disconnected" | "requesting" | "waiting" | "connected";

const uiReducer: ChooMiddleware = (state, emitter) => {
    state.ui = {
        roomSatus: "disconnected"
    };
    
    console.log(1)
    emitter.on(state.events.CHAT_ROOM_UPDATE, newStatus => {
        state.ui.roomStatus = newStatus;
        if (newStatus !== "connected") {
            return emitter.emit(state.events.RENDER);
        }
        return console.log({ newStatus });
    });
};

module.exports = uiReducer;
