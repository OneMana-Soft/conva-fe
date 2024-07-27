import React, {useEffect} from "react";
import {getToken, onMessage } from "firebase/messaging";
import { messaging, vapidKey } from '../../utils/firebaseConfig';
import profileService from "../../services/ProfileService.ts";
import {
    FIREBASE_PUSH_DATA_BODY, FIREBASE_PUSH_DATA_THREAD_ID,
    FIREBASE_PUSH_DATA_TITLE,
    FIREBASE_PUSH_DATA_TYPE,
    FIREBASE_PUSH_DATA_TYPE_ID, FIREBASE_PUSH_DATA_USERNAME
} from "../../utils/pushConsts.ts";

const PERMISSION_DENIED = 'denied'
const PERMISSION_GRANTED = "granted"

const PushNotification: React.FC = () => {


    // const isInStandaloneMode = () =>
    //     (window.matchMedia('(display-mode: standalone)').matches) || (('standalone' in window.navigator) && (window.navigator.standalone)) || document.referrer.includes('android-app://');


    const handleNotificationGranted = async () => {
        const swRegistration = await navigator.serviceWorker.register('/service-worker.js');
        const token = await getToken(messaging, {vapidKey: vapidKey, serviceWorkerRegistration: swRegistration})
        await profileService.UpdateFCMTOken({fcm_token: token})
        onMessage(messaging, (payload)=>{
            // if(!isInStandaloneMode()) {
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
                    }
                };

                new Notification(notificationTitle, notificationOptions)

            }
            // }

        })
    }
    const handlePermission = async () => {
        try {

            if(Notification.permission !== PERMISSION_DENIED) {

                Notification.requestPermission().then(async (permission)=>{
                    if(permission == PERMISSION_GRANTED) {

                        await handleNotificationGranted()

                    }
                })

                if(Notification.permission == PERMISSION_GRANTED) {

                    await handleNotificationGranted()
                }
            }
        } catch (error) {
            console.error('Error getting messaging token:', error);
        }
    };

    useEffect(() => {

        handlePermission().catch((err)=>{
            console.log("fcm error err:", err)
        });


        return () => {
            onMessage(messaging, ()=>{})
        };
    }, []);



    return null
}

export default PushNotification