// @flow
const OT = require("@opentok/client");
const extend = require("xtend");
const config = require("./config");

type InitializeSession = (state: Object, emitter: Object) => void;
const initializeSession: InitializeSession = (state, emitter) => {
    const { apiKey, sessionId, token } = state.chat.room;
    if (!apiKey || !sessionId || !token) {
        return;
    }
    const handleResponse = status => error => {
        if (error) {
            alert(error.message);
        }
        if (status) {
            emitter.emit(state.events.CHAT_ROOMSTATUS_UPDATE, status);
        }
    };
    const session = OT.initSession(apiKey, sessionId);

    const initPublisher = () => {
        const name = state.user && state.user.name || '';
        const pubOptions = extend(config.opentok.publisherProperties, {
            insertMode: "append",
            name
        });
        return OT.initPublisher( "publisher", pubOptions, handleResponse());
    };

    session.connect(token, error => {
        if (error) {
            handleResponse()(error);
        } else {
            if (state.chat.publishFirst) {
                session.publish(initPublisher(), handleResponse());
            }
            handleResponse("waiting")();
            session.on("streamCreated", event => {
                if (!state.chat.publishFirst) {
                    session.publish(initPublisher(), handleResponse());
                }
                const subOptions = extend(config.opentok.subscriberProperties, {insertMode: "append"})
                session.subscribe( event.stream, "subscriber", subOptions, handleResponse("connected"));
            });
        }
    });
};

module.exports = initializeSession;
