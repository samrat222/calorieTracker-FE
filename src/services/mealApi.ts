/**
 * Meal API Service
 * Handles meal CRUD and food image analysis
 */

import { API_BASE_URL } from "src/constants/constants";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  id?: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface Meal {
  id: string;
  userId: string;
  mealType: MealType;
  description?: string;
  imageUrl?: string;
  totalCalories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  mealDate: string;
  createdAt: string;
  foodItems: FoodItem[];
}

export interface CreateMealPayload {
  mealType: MealType;
  description?: string;
  totalCalories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  mealDate?: string;
  foodItems?: FoodItem[];
}

export interface AnalysisResult {
  success: boolean;
  foodItems: FoodItem[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
  };
  mealDescription: string;
  imageUrl?: string;
}

export interface TodaysMealsResponse {
  success: boolean;
  data: {
    meals: Meal[];
    totals: {
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFats: number;
      totalFiber: number;
    };
    mealsCount: number;
    date: string;
    goal?: number;
  };
}

export interface MealsListResponse {
  success: boolean;
  data: Meal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const mealApi = {
  /**
   * Get today's meals
   */
  getTodaysMeals: async (token: string): Promise<TodaysMealsResponse> => {
    const response = await fetch(`${API_BASE_URL}/meals/today`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get meals");
    }
    return data;
  },

  /**
   * Analyze food image with AI
   */
  analyzeFood: async (
    token: string,
    imageUri?: string,
    description?: string,
  ): Promise<AnalysisResult> => {
    const formData = new FormData();

    if (imageUri) {
      // React Native requires this format for FormData images
      const imageFile = {
        uri: imageUri,
        type: "image/jpeg",
        name: "food.jpg",
      } as any;
      formData.append("image", imageFile);
    }

    if (description) {
      formData.append("description", description);
    }

    const fetchResponse = await fetch(`${API_BASE_URL}/meals/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
      },
      body: formData,
    });

    const data = await fetchResponse.json();
    if (!fetchResponse.ok) {
      throw new Error(data.message || "Failed to analyze food");
    }
    // API returns { success, message, data: { ...analysisResult } }
    return data.data;
  },

  /**
   * Quick log meal from analysis result
   */
  quickLogMeal: async (
    token: string,
    mealType: MealType,
    analysisResult: AnalysisResult,
    imageUrl?: string,
  ): Promise<{ success: boolean; data: { meal: Meal } }> => {
    const response = await fetch(`${API_BASE_URL}/meals/quick-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mealType,
        imageUrl,
        analysisResult: {
          foodItems: analysisResult.foodItems,
          totalNutrition: analysisResult.totalNutrition,
          mealDescription: analysisResult.mealDescription,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to log meal");
    }
    return data;
  },

  /**
   * Create a new meal
   */
  createMeal: async (
    token: string,
    payload: CreateMealPayload,
    imageUri?: string,
  ): Promise<{ success: boolean; data: { meal: Meal } }> => {
    const formData = new FormData();

    if (imageUri) {
      // React Native requires this format for FormData images
      const imageFile = {
        uri: imageUri,
        type: "image/jpeg",
        name: "food.jpg",
      } as any;
      formData.append("image", imageFile);
    }

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "foodItems") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const fetchResponse = await fetch(`${API_BASE_URL}/meals`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await fetchResponse.json();
    if (!fetchResponse.ok) {
      throw new Error(data.message || "Failed to create meal");
    }
    return data;
  },

  /**
   * Get all meals with pagination
   */
  getMeals: async (
    token: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      mealType?: MealType;
    },
  ): Promise<MealsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.mealType) queryParams.append("mealType", params.mealType);

    const response = await fetch(
      `${API_BASE_URL}/meals?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get meals");
    }
    return data;
  },

  /**
   * Get meal by ID
   */
  getMealById: async (
    token: string,
    id: string,
  ): Promise<{ success: boolean; data: { meal: Meal } }> => {
    const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get meal");
    }
    return data;
  },

  /**
   * Update meal
   */
  updateMeal: async (
    token: string,
    id: string,
    payload: Partial<CreateMealPayload>,
  ): Promise<{ success: boolean; data: { meal: Meal } }> => {
    const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update meal");
    }
    return data;
  },

  /**
   * Delete meal
   */
  deleteMeal: async (
    token: string,
    id: string,
  ): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete meal");
    }
    return data;
  },
};

export default mealApi;
