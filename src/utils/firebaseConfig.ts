// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import 'firebase/messaging';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBg4Ivjk-00XTs-_laEM_a85EWMGoHdnuE",
    authDomain: "onemana-conva.firebaseapp.com",
    projectId: "onemana-conva",
    storageBucket: "onemana-conva.appspot.com",
    messagingSenderId: "751036168243",
    appId: "1:751036168243:web:da94e3eb699c7255f74b46"
};

export const vapidKey = "BPLSq2nvEO25_6MdNV9y5_CtFAiWeoTJVYfLN6KmPciWd3PLewcauuO3B40Fxl0DYcycoqxAgwdssvq1CIiM27c";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
