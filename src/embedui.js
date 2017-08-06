// @flow
import type { ChooMiddleware } from "./app";

// click(call) -> requesting
// requesting -> waiting (esperando o outro peer)
// requesting -> connected (outro peer conectado)

type RoomStatus = "disconnected" | "requesting" | "waiting" | "connected";
const uiReducer: ChooMiddleware = (state, emitter) => {
    state.roomStatus = "disconnected";
    emitter.on("room:update", newStatus => {
        state.roomStatus = newStatus;
        if (newStatus !== "connected") {
            emitter.emit(state.events.RENDER);
        }
    });
};

module.exports = uiReducer;
