// @flow
import type { ChooMiddleware } from "../../app";

const { apiCall } = require("../../network");

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
        emitter.emit(state.events.CHAT_ROOMSTATUS_UPDATE, "requesting");
        return apiCall({ query }, (err, resp, body) => {
            if (err || !body.data.room) {
                if (err) {
                    emitter.emit(state.events.ERROR_API, err);
                }
                return emitter.emit(
                    state.events.CHAT_ROOMSTATUS_UPDATE,
                    "disconnected"
                );
            }
            const room = body.data.room;
            const publishFirst = false;
            return emitter.emit(state.events.CHAT_INIT, { room, publishFirst });
        });
    });

    emitter.on(state.events.API_NOTIFYGROUP, ({ groupId, room }) => {
        const query = `
        mutation($groupId:ID!, $payload:String){
            notifyUserGroup(id:$groupId, payload:$payload)
        }`;
        const roomEncoded = JSON.stringify(room);
        const payload = JSON.stringify({
            title: "Support call",
            options: {
                tag: room.sessionId,
                requireInteraction: true,
                body: `From group ${groupId}`,
                data: room
            }
        });
        const variables = { groupId, payload };
        return apiCall({ query, variables }, (err, resp, body) => {
            if (err) {
                emitter.emit(state.events.ERROR_API, err);
                return emitter.emit(
                    state.events.CHAT_ROOMSTATUS_UPDATE,
                    "disconnected"
                );
            }
            return console.log(body.data);
        });
    });
};

module.exports = apiReducers;
