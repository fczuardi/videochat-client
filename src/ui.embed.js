// @flow
import type { ChooMiddleware } from "./app";

type RoomStatus = "disconnected" | "requesting" | "waiting" | "connected";
const uiReducer: ChooMiddleware = (state, emitter) => {
    (state.ui = {
        roomSatus: "disconnected"
    }), emitter.on("room:update", newStatus => {
        state.ui.roomStatus = newStatus;
        if (newStatus !== "connected") {
            return emitter.emit(state.events.RENDER);
        }
        return console.log({ newStatus });
    });
};

module.exports = uiReducer;
