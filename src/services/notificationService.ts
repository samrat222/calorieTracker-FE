import { getApp } from "@react-native-firebase/app";
import * as Notifications from "expo-notifications";
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getMessaging,
} from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";
import { navigationRef, prettier } from "@utils/utils";
import { API_BASE_URL } from "src/constants/constants";
import { Platform } from "react-native";

// Configure how notifications should be handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPermissionResult {
  granted: boolean;
  status: FirebaseMessagingTypes.AuthorizationStatus;
}

export interface DeviceInfoResult {
  deviceId: string;
  fcmToken: string;
}

// Initialize Firebase App and Messaging
const app = getApp();
export const messaging = getMessaging(app);

let foregroundUnsubscribe: (() => void) | null = null;
let notificationResponseSubscription: any = null;
let notificationsInitialized = false;
let lastDeviceInfo: DeviceInfoResult | null = null;

const setupNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
};

const getMessageTitleAndBody = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): { title?: string; body?: string } => {
  const notification = remoteMessage.notification;
  const data = remoteMessage.data || {};

  return {
    title: notification?.title ?? data.title,
    body: notification?.body ?? data.body,
  };
};

const notificationService = {
  /**
   * Request notification permission
   */
  requestNotificationPermission:
    async (): Promise<NotificationPermissionResult> => {
      try {
        await setupNotificationChannel();

        const authStatus = await messaging.requestPermission();
        const granted =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          const { status: newStatus } =
            await Notifications.requestPermissionsAsync();
          if (newStatus !== "granted") {
            return {
              granted: false,
              status: authStatus,
            };
          }
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
    },

  /**
   * Get FCM Token
   */
  getFCMToken: async (): Promise<string | null> => {
    try {
      const fcmToken = await messaging.getToken();
      console.log("FCM Token:", fcmToken);
      return fcmToken;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  },

  /**
   * Get Device Unique ID
   */
  getDeviceId: async (): Promise<string | null> => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      console.log("Device ID:", deviceId);
      return deviceId;
    } catch (error) {
      console.error("Error getting device ID:", error);
      return null;
    }
  },

  /**
   * Synchronize token with backend
   */
  updateTokenOnBackend: async (
    token: string,
    authToken: string,
    isLogin: boolean = false,
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/fcm-token`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fcmToken: token, isLogin }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update FCM token");
      }
      console.log(
        `FCM token updated on backend successfully (isLogin: ${isLogin})`,
      );
    } catch (error) {
      console.error("Error updating FCM token on backend:", error);
    }
  },

  /**
   * Initialize device info (Token + ID)
   */
  initializeDeviceInfo: async (): Promise<DeviceInfoResult | null> => {
    try {
      const [deviceId, fcmToken] = await Promise.all([
        notificationService.getDeviceId(),
        notificationService.getFCMToken(),
      ]);

      if (!deviceId || !fcmToken) {
        throw new Error("Failed to get device info or FCM token");
      }

      return { deviceId, fcmToken };
    } catch (error) {
      console.error("Error initializing device info:", error);
      return null;
    }
  },

  /**
   * Handle foreground messages by scheduling a local notification
   */
  handleForegroundMessage: async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> => {
    const { title, body } = getMessageTitleAndBody(remoteMessage);

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
  },

  /**
   * Setup foreground listener
   */
  setupForegroundMessaging: (): (() => void) | null => {
    try {
      // Clean up existing listener if it exists to prevent duplicates
      if (foregroundUnsubscribe) {
        foregroundUnsubscribe();
        foregroundUnsubscribe = null;
      }

      foregroundUnsubscribe = messaging.onMessage(
        async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          prettier("FCM message received in foreground", remoteMessage);
          notificationService.handleForegroundMessage(remoteMessage);
        },
      );

      return foregroundUnsubscribe;
    } catch (error) {
      console.error("Error setting up foreground messaging:", error);
      return null;
    }
  },

  /**
   * Setup background handler
   */
  setupBackgroundMessaging: (): void => {
    messaging.setBackgroundMessageHandler(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        prettier("FCM message received in background", remoteMessage);
        await notificationService.handleForegroundMessage(remoteMessage);
      },
    );
  },

  /**
   * Logic to navigate when a notification is tapped
   */
  handleNotificationNavigation: (data: any): void => {
    try {
      if (!navigationRef?.isReady()) {
        console.log("Navigation not ready, skipping navigation");
        return;
      }

      // Modify this based on your app's navigation structure
      // navigationRef.navigate("NOTIFICATION" as any);
      // Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error handling notification navigation:", error);
    }
  },

  /**
   * Listener for notification response (tap)
   */
  setupNotificationListeners: (): void => {
    try {
      // Clean up existing listener if it exists to prevent duplicates
      if (notificationResponseSubscription) {
        notificationResponseSubscription.remove();
        notificationResponseSubscription = null;
      }

      notificationResponseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          prettier("Notification tapped", response);

          const data =
            Object.keys(response.notification.request.content.data).length > 0
              ? response.notification.request.content.data
              : null;
          if (data) {
            notificationService.handleNotificationNavigation(data);
          }
        });

      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (!response) return;
          prettier("Notification tapped (cold start)", response);
          const data =
            Object.keys(response.notification.request.content.data).length > 0
              ? response.notification.request.content.data
              : null;
          if (data) {
            notificationService.handleNotificationNavigation(data);
          }
        })
        .catch((error) => {
          console.error("Error getting last notification response:", error);
        });
    } catch (error) {
      console.error("Error setting up notification listeners:", error);
    }
  },

  /**
   * Cleanup listeners
   */
  cleanupNotifications: (): void => {
    if (foregroundUnsubscribe) {
      foregroundUnsubscribe();
      foregroundUnsubscribe = null;
    }
    if (notificationResponseSubscription) {
      notificationResponseSubscription.remove();
      notificationResponseSubscription = null;
    }
    notificationsInitialized = false;
    lastDeviceInfo = null;
  },

  /**
   * Main entry point to start the service
   */
  initializeNotifications: async (
    authToken: string,
    isLogin: boolean = false,
  ): Promise<DeviceInfoResult | null> => {
    try {
      if (notificationsInitialized && lastDeviceInfo) {
        if (isLogin) {
          await notificationService.updateTokenOnBackend(
            lastDeviceInfo.fcmToken,
            authToken,
            true,
          );
        }
        return lastDeviceInfo;
      }

      const permissionResult =
        await notificationService.requestNotificationPermission();

      if (!permissionResult.granted) {
        console.log("Notification permission not granted");
        return null;
      }

      const deviceInfo = await notificationService.initializeDeviceInfo();

      if (deviceInfo) {
        // Sync with backend
        await notificationService.updateTokenOnBackend(
          deviceInfo.fcmToken,
          authToken,
          isLogin,
        );
      }

      notificationService.setupForegroundMessaging();
      notificationService.setupNotificationListeners();

      notificationsInitialized = true;
      lastDeviceInfo = deviceInfo;

      return deviceInfo;
    } catch (error) {
      console.error("Error initializing notification service:", error);
      return null;
    }
  },
};

export default notificationService;
