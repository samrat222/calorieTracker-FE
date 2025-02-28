import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>('sfs');
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
    retrieveToken();
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
