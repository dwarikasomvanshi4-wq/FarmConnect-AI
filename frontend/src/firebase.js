import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyASTO3ZGsxcfVxrwEuBrfFeqU2t2k9Izfs",
  authDomain: "farmconnect-ai-81814.firebaseapp.com",
  projectId: "farmconnect-ai-81814",
  storageBucket: "farmconnect-ai-81814.firebasestorage.app",
  messagingSenderId: "238597556000",
  appId: "1:238597556000:web:678687668f118f5fa53945",
};

const VAPID_KEY = "BJR3cW4uG92P7xhOn4I7Xcfy2wOS_hbn-d4KbY2neGBZ0XY0CQkWUopXPW8n1fDpAJUBehnU5K6cmG9HHb3tzmk";


const app = initializeApp(firebaseConfig);

export { app, VAPID_KEY };

export const getFirebaseMessaging = async () => {
  if (!(await isSupported())) return null;
  return getMessaging(app);
};