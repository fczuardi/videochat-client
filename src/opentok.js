// @flow
const OT = require("@opentok/client");
// Handling all of our errors here by alerting them
function handleError(error) {
    if (error) {
        alert(error.message);
    }
}

type Room = { apiKey: string, sessionId: string, token: string };
type InitializeSession = (room: Room) => void;
const initializeSession: InitializeSession = ({ apiKey, sessionId, token }) => {
    if (!apiKey || !sessionId || !token) {
        return;
    }
    var session = OT.initSession(apiKey, sessionId);
    // Connect to the session
    session.connect(token, function(error) {
        // If the connection is successful, publish to the session
        if (error) {
            handleError(error);
        } else {
            // Subscribe to a newly created stream
            session.on("streamCreated", function(event) {
                // Create a publisher
                var publisher = OT.initPublisher(
                    "publisher",
                    {
                        insertMode: "append",
                        width: "100%",
                        height: "100%"
                    },
                    handleError
                );
                session.publish(publisher, handleError);
                session.subscribe(
                    event.stream,
                    "subscriber",
                    {
                        insertMode: "append",
                        width: "100%",
                        height: "100%"
                    },
                    handleError
                );
            });
        }
    });
};

module.exports = initializeSession;
