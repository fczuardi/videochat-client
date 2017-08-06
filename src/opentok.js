// @flow
const OT = require("@opentok/client");

type Room = { apiKey: string, sessionId: string, token: string };
type InitializeSession = (room: Room, emitter: Object) => void;
const initializeSession: InitializeSession = ({ apiKey, sessionId, token }, emitter) => {
    emitter.emit("render")
    if (!apiKey || !sessionId || !token) {
        return;
    }
    const handleResponse = (status) => (error) => {
        if (error) {
            alert(error.message);
        }
        if(status) {
            emitter.emit("room:update", status)
        }
    }
    const session = OT.initSession(apiKey, sessionId);
    // Connect to the session
    session.connect(token, (error) => {
        // If the connection is successful, publish to the session
        if (error) {
            handleResponse()(error);
        } else {
            handleResponse("waiting")()
            // Subscribe to a newly created stream
            session.on("streamCreated", (event) => {
                // Create a publisher
                const publisher = OT.initPublisher(
                    "publisher",
                    {
                        insertMode: "append",
                        width: "100%",
                        height: "100%"
                    },
                    handleResponse()
                );
                session.publish(publisher, handleResponse());
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
