// service-worker.ts

// import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { cleanupOutdatedCaches,  precacheAndRoute } from 'workbox-precaching'

import { clientsClaim } from 'workbox-core'
// import { NavigationRoute, registerRoute } from 'workbox-routing'


import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage} from "firebase/messaging/sw";
import {
    FIREBASE_PUSH_DATA_BODY,
    FIREBASE_PUSH_DATA_THREAD_ID,
    FIREBASE_PUSH_DATA_TITLE,
    FIREBASE_PUSH_DATA_TYPE,
    FIREBASE_PUSH_DATA_TYPE_CHANNEL,
    FIREBASE_PUSH_DATA_TYPE_CHAT, FIREBASE_PUSH_DATA_TYPE_CHAT_COMMENT,
    FIREBASE_PUSH_DATA_TYPE_COMMENT,
    FIREBASE_PUSH_DATA_TYPE_ID, FIREBASE_PUSH_DATA_TYPE_POST_COMMENT,
    FIREBASE_PUSH_DATA_USERNAME
} from "./utils/pushConsts.ts";

declare let self: ServiceWorkerGlobalScope

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

// let allowlist: undefined | RegExp[]
// if (import.meta.env.DEV)
//     allowlist = [/^\/$/]

// // to allow work offline
// registerRoute(new NavigationRoute(
//     createHandlerBoundToURL('index.html'),
//     { allowlist },
// ))


// import profileService from "./services/ProfileService.js";

// const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

const firebaseConfig = {
    apiKey: "AIzaSyBg4Ivjk-00XTs-_laEM_a85EWMGoHdnuE",
    authDomain: "onemana-conva.firebaseapp.com",
    projectId: "onemana-conva",
    storageBucket: "onemana-conva.appspot.com",
    messagingSenderId: "751036168243",
    appId: "1:751036168243:web:da94e3eb699c7255f74b46"
};

const firebaseApp = initializeApp(firebaseConfig);

const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, async (payload) => {

    if(payload.data) {
        const notificationTitle = payload.data[FIREBASE_PUSH_DATA_TITLE] || '';
        const notificationOptions = {
            body: payload.data[FIREBASE_PUSH_DATA_BODY],
            icon: 'pwa-192x192.png',
            badge: 'monochrome-pwa-192x192.png',
            sound: 'default',
            data: {
                type: payload.data[FIREBASE_PUSH_DATA_TYPE],
                type_id: payload.data[FIREBASE_PUSH_DATA_TYPE_ID],
                thread_id: payload.data[FIREBASE_PUSH_DATA_THREAD_ID],
                userName: payload.data[FIREBASE_PUSH_DATA_USERNAME],
                newMessageCount:1
            }
        };

        const promiseChain = registration.getNotifications().then((notifications) => {
            let currentNotification;

            for (let i = 0; i < notifications.length; i++) {
                const isComment = notifications[i].title.split('-')[0].trim().toLowerCase() == FIREBASE_PUSH_DATA_TYPE_COMMENT
                if (notifications[i].title && notifications[i].title === notificationTitle && !isComment) {
                    currentNotification = notifications[i];
                }
            }

            return currentNotification;
        });


        promiseChain.then((currentNotification) => {
            if (currentNotification) {
                // We have an open notification, let's do something with it.
                const messageCount = currentNotification.data.newMessageCount + 1;

                notificationOptions.body = `You have ${messageCount} new messages from ${notificationOptions.data.userName}.`;
                notificationOptions.data.newMessageCount = messageCount;

                // Remember to close the old notification.
                currentNotification.close();
            }

            return registration.showNotification(
                notificationTitle,
                notificationOptions
            );
        });
    }


});

// Handle push event directly
// self.addEventListener('push', function(event) {
//     if (event.data) {
//         const data = event.data.json()
//         const notificationTitle = data[FIREBASE_PUSH_DATA_TITLE] || '';
//         const notificationOptions = {
//             body: data[FIREBASE_PUSH_DATA_BODY],
//             icon: 'pwa-192x192.png',
//             badge: 'monochrome-pwa-192x192.png',
//             sound: 'default',
//             data: {
//                 type: data[FIREBASE_PUSH_DATA_TYPE],
//                 type_id: data[FIREBASE_PUSH_DATA_TYPE_ID],
//                 thread_id: data[FIREBASE_PUSH_DATA_THREAD_ID],
//                 userName: data[FIREBASE_PUSH_DATA_USERNAME],
//                 newMessageCount:1
//             }
//         };
//
//         const promiseChain = registration.getNotifications().then((notifications) => {
//             let currentNotification;
//
//             for (let i = 0; i < notifications.length; i++) {
//                 if (notifications[i].title && notifications[i].title === notificationTitle) {
//                     currentNotification = notifications[i];
//                 }
//             }
//
//             return currentNotification;
//         });
//
//
//         promiseChain.then((currentNotification) => {
//             if (currentNotification) {
//                 // We have an open notification, let's do something with it.
//                 const messageCount = currentNotification.data.newMessageCount + 1;
//
//                 notificationOptions.body = `You have ${messageCount} new messages from ${notificationOptions.data.userName}.`;
//                 notificationOptions.data.newMessageCount = messageCount;
//
//                 // Remember to close the old notification.
//                 currentNotification.close();
//             }
//
//             event.waitUntil(registration.showNotification(
//                 notificationTitle,
//                 notificationOptions
//             ))
//         });
//     }
// });

self.addEventListener('notificationclick', function(event) {
        event.notification.close()
        switch(event.notification.data.type){
            case FIREBASE_PUSH_DATA_TYPE_CHAT:
                clients.openWindow('/chat/'+event.notification.data.type_id);
                break;
            case FIREBASE_PUSH_DATA_TYPE_CHANNEL:
                clients.openWindow('/channel/'+event.notification.data.type_id);
                break;
            case FIREBASE_PUSH_DATA_TYPE_CHAT_COMMENT:
                clients.openWindow('/chat/'+event.notification.data.type_id+'/'+event.notification.data.thread_id);
                break;
            case FIREBASE_PUSH_DATA_TYPE_POST_COMMENT:
                clients.openWindow('/channel/'+event.notification.data.type_id+'/'+event.notification.data.thread_id);
                break;
        }
    },

false);



self.skipWaiting()
clientsClaim()