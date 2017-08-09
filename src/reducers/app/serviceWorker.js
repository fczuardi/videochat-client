// @flow
import type { ChooMiddleware } from "../../app";

const toUint8Array = require("../../urlBase64ToUint8Array");

const workerFilePath = "./sw.js";

const worker: ChooMiddleware = (state, emitter) => {
    state.worker = {
        registration: null
    };

    emitter.on(state.events.WORKER_REGISTER, () => {
        if (!navigator.serviceWorker) {
            return console.error("Browser doesnt have service worker support");
        }
        navigator.serviceWorker
            .register(workerFilePath)
            .then(
                registration =>
                    emitter.emit(state.events.WORKER_REGISTERED, registration),
                console.error
            );
    });

    emitter.on(state.events.WORKER_REGISTERED, registration => {
        state.worker.registration = registration;
        return registration.pushManager
            .getSubscription()
            .then(subscription =>
                emitter.emit(
                    state.events.WORKER_SUBSCRIPTION_INFO,
                    subscription
                )
            );
    });

    emitter.on(state.events.WORKER_SUBSCRIPTION_INFO, subscription => {
        if (subscription) {
            return emitter.emit(state.events.WORKER_SUBSCRIBED, subscription);
        }
        return emitter.emit(state.events.API_PUSHSERVER_PUBKEY);
    });

    emitter.on(state.events.WORKER_SERVERKEY, serverKey => {
        const options = {
            userVisibleOnly: true,
            applicationServerKey: toUint8Array(serverKey)
        };
        return state.worker.registration.pushManager
            .subscribe(options)
            .then(subscription =>
                emitter.emit(state.events.WORKER_SUBSCRIBED, subscription)
            );
    });

    emitter.on(state.events.WORKER_SUBSCRIBED, subscription => {
        const keyBuffer = subscription.getKey("p256dh");
        const authBuffer = subscription.getKey("auth");
        const endpoint = subscription.endpoint;
        const key = btoa(
            String.fromCharCode.apply(null, new Uint8Array(keyBuffer))
        );
        const auth = btoa(
            String.fromCharCode.apply(null, new Uint8Array(authBuffer))
        );
        const webPushInfo = { endpoint, key, auth };
        const variables = { id: state.user.username, update: { webPushInfo } };
        console.log({ variables });
        emitter.emit(state.events.API_USER_UPDATE, variables);
    });
};

module.exports = worker;
