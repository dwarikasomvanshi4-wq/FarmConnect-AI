import { getToken } from "firebase/messaging";
import { getFirebaseMessaging, VAPID_KEY } from "./firebase";
import api from "./services/api";

export const registerFarmerForNotifications = async () => {
  try {
    const email = sessionStorage.getItem("userEmail");
    const role = sessionStorage.getItem("userRole");

    if (!email || role?.toLowerCase() !== "farmer") {
      return { success: false, message: "Farmer login required." };
    }

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return {
        success: false,
        message: "This browser does not support notifications.",
      };
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return {
        success: false,
        message: "Notification permission was not granted.",
      };
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      return {
        success: false,
        message: "Firebase messaging is not supported in this browser.",
      };
    }

    const serviceWorkerRegistration =
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (!token) {
      return {
        success: false,
        message: "Unable to generate notification token.",
      };
    }

    await api.post("/register-device-token", {
      email,
      role,
      token,
    });

    return {
      success: true,
      message: "Notifications enabled successfully!",
    };
  } catch (error) {
    console.error("Notification registration error:", error);

    return {
      success: false,
      message: "Unable to enable notifications. Please try again.",
    };
  }
};