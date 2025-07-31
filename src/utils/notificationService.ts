import { getApp } from "@react-native-firebase/app";
import * as Notifications from "expo-notifications";
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getMessaging,
} from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";
import { navigationRef, prettier } from "./utils";

export interface NotificationPermissionResult {
  granted: boolean;
  status: FirebaseMessagingTypes.AuthorizationStatus;
}

export interface DeviceInfo {
  deviceId: string;
  fcmToken: string;
}

const app = getApp();
export const messaging = getMessaging(app);

let foregroundUnsubscribe: (() => void) | null = null;
let notificationResponseSubscription: any = null;

export const requestNotificationPermission =
  async (): Promise<NotificationPermissionResult> => {
    try {
      const authStatus = await messaging.requestPermission();
      const granted =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (granted) {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      }

      return {
        granted,
        status: authStatus,
      };
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return {
        granted: false,
        status: AuthorizationStatus.NOT_DETERMINED,
      };
    }
  };

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const fcmToken = await messaging.getToken();
    console.log("FCM Token:", fcmToken);
    return fcmToken;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

export const getDeviceId = async (): Promise<string | null> => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    console.log("Device ID:", deviceId);
    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    return null;
  }
};

export const initializeDeviceInfo = async (): Promise<DeviceInfo | null> => {
  try {
    const [deviceId, fcmToken] = await Promise.all([
      getDeviceId(),
      getFCMToken(),
    ]);

    if (!deviceId || !fcmToken) {
      throw new Error("Failed to get device info or FCM token");
    }

    return { deviceId, fcmToken };
  } catch (error) {
    console.error("Error initializing device info:", error);
    return null;
  }
};

const handleForegroundMessage = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
  const { title, body } = remoteMessage.notification || {};

  if (title && body) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: remoteMessage?.data || {},
      },
      trigger: null,
    });
  }
};

export const setupForegroundMessaging = (): (() => void) | null => {
  try {
    foregroundUnsubscribe = messaging.onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        prettier("FCM message received in foreground:", remoteMessage);
        handleForegroundMessage(remoteMessage);
      },
    );

    return foregroundUnsubscribe;
  } catch (error) {
    console.error("Error setting up foreground messaging:", error);
    return null;
  }
};

export const setupBackgroundMessaging = (): void => {
  messaging.setBackgroundMessageHandler(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      prettier("FCM message received in background:", remoteMessage);
    },
  );
};

export const handleNotificationNavigation = (data: any): void => {
  try {
    if (!navigationRef?.isReady()) {
      console.log("Navigation not ready, skipping navigation");
      return;
    }

    navigationRef.navigate("NOTIFICATION");
    Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error("Error handling notification navigation:", error);
  }
};

const handleNotificationResponse = (
  response: Notifications.NotificationResponse,
): void => {
  try {
    prettier("Notification tapped:", response);

    const data =
      Object.keys(response.notification.request.content.data).length > 0
        ? response.notification.request.content.data
        : null;
    if (data) {
      handleNotificationNavigation(data);
    }
  } catch (error) {
    console.error("Error handling notification response:", error);
  }
};

export const setupNotificationListeners = (): void => {
  try {
    notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse,
      );
  } catch (error) {
    console.error("Error setting up notification listeners:", error);
  }
};

export const cleanupNotifications = (): void => {
  if (foregroundUnsubscribe) {
    foregroundUnsubscribe();
    foregroundUnsubscribe = null;
  }
  if (notificationResponseSubscription) {
    notificationResponseSubscription.remove();
    notificationResponseSubscription = null;
  }
};

export const initializeNotifications = async (): Promise<{
  permissionGranted: boolean;
  deviceInfo: DeviceInfo | null;
}> => {
  try {
    const permissionResult = await requestNotificationPermission();

    if (!permissionResult.granted) {
      console.log("Notification permission not granted");
      return {
        permissionGranted: false,
        deviceInfo: null,
      };
    }

    const deviceInfo = await initializeDeviceInfo();
    setupForegroundMessaging();
    setupNotificationListeners();

    return {
      permissionGranted: true,
      deviceInfo,
    };
  } catch (error) {
    console.error("Error initializing notification service:", error);
    return {
      permissionGranted: false,
      deviceInfo: null,
    };
  }
};
