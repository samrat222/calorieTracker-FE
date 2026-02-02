/**
 * Authentication API Service
 * Handles user registration, login, and logout
 */

import { API_BASE_URL } from "src/constants/constants";

export interface LoginResponse {
  success: boolean;
  data: {
    user: UserData;
    token: string;
  };
}

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  isOnboarded: boolean;
  age?: number;
  weight?: number;
  height?: number;
  gender?: "male" | "female";
  activityLevel?: number;
  goal?: "lose" | "gain" | "maintain" | null;
  bmi?: number;
  dailyCalorieGoal?: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const authApi = {
  /**
   * Register a new user
   */
  register: async (
    payload: RegisterPayload,
    token?: string,
  ): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    return data;
  },

  /**
   * Login user
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    return data;
  },

  /**
   * Logout user
   */
  logout: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Logout failed");
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (
    token: string,
  ): Promise<{ data: { user: UserData } }> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get user");
    }
    return data;
  },
};

export default authApi;
