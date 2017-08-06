// @flow
const OT = require("@opentok/client");

type Room = { apiKey: string, sessionId: string, token: string };
type InitializeSession = (
    room: Room,
    emitter: Object,
    publishFirst: boolean
) => void;
const initializeSession: InitializeSession = (
    { apiKey, sessionId, token },
    emitter,
    publishFirst = false
) => {
    emitter.emit("render");
    if (!apiKey || !sessionId || !token) {
        return;
    }
    const handleResponse = status => error => {
        if (error) {
            alert(error.message);
        }
        if (status) {
            emitter.emit("room:update", status);
        }
    };
    const session = OT.initSession(apiKey, sessionId);
    //
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
            if (publishFirst) {
                session.publish(initPublisher(), handleResponse());
            }
            handleResponse("waiting")();
            // Subscribe to a newly created stream
            session.on("streamCreated", event => {
                // Create a publisher
                if (!publishFirst) {
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
