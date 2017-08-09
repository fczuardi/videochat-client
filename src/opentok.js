// @flow
const OT = require("@opentok/client");

type InitializeSession = (state: Object, emitter: Object) => void;
const initializeSession: InitializeSession = (state, emitter) => {
    const { apiKey, sessionId, token } = state.chat.room;
    emitter.emit(state.events.RENDER);
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
        return OT.initPublisher(
            "publisher",
            {
                insertMode: "append",
                width: "100%",
                height: "100%"
            },
            handleResponse()
        );
    };
    // Connect to the session
    session.connect(token, error => {
        // If the connection is successful, publish to the session
        if (error) {
            handleResponse()(error);
        } else {
            if (state.chat.publishFirst) {
                session.publish(initPublisher(), handleResponse());
            }
            handleResponse("waiting")();
            // Subscribe to a newly created stream
            session.on("streamCreated", event => {
                // Create a publisher
                if (!state.chat.publishFirst) {
                    session.publish(initPublisher(), handleResponse());
                }
                session.subscribe(
                    event.stream,
                    "subscriber",
                    {
                        insertMode: "append",
                        width: "100%",
                        height: "100%"
                    },
                    handleResponse("connected")
                );
            });
        }
    });
};

module.exports = initializeSession;
