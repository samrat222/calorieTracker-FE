import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";

interface AuthContextType {
  token: string | null;
  storeToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  loading: boolean;
  deviceId: string | null;
  fcmToken: string | null;
  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<undefined>>;
}

const requestPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") {
      alert("Permission to show notifications denied!");
    }
  }
};

const setupNotificationChannel = async () => {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>("sfs");
  const [loading, setLoading] = useState<boolean>(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const storeToken = async (newToken: string) => {
    try {
      await SecureStore.setItemAsync("token", newToken);
      setToken(newToken);
      console.log("Token stored successfully");
    } catch (error) {
      console.error("Error storing token:", error);
    }
  };

  const clearToken = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      setToken(null);
      console.log("Token cleared successfully");
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  };

  const retrieveToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      setToken(storedToken);
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const id = await DeviceInfo.getUniqueId();
        setDeviceId(id);
        console.log("Device ID:", id);

        await requestPermission();
        await setupNotificationChannel();
        const fcm = await messaging().getAPNSToken();
        console.log("APN FCM Token:", fcm);
        messaging()
          .getAPNSToken()
          .then(async (apnsToken) => {
            const token = await messaging().getToken();
            setFcmToken(token);
            console.log("FCM Token:", token);
          });
        await retrieveToken();
        setLoading(false);
      } catch (error) {
        console.log("Error during initialization:", error);
      }
    };

    initialize();

    // Handle foreground messages and show notifications
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      console.log("A new FCM message arrived!", remoteMessage);

      const { title, body } = remoteMessage.notification || {
        title: remoteMessage.data.title || "New Notification",
        body: remoteMessage.data.body || "You have a new message!",
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
        },
        trigger: null,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        storeToken,
        clearToken,
        loading,
        deviceId,
        fcmToken,
        profile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
