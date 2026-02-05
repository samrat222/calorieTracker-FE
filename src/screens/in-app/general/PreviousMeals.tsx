import React, { FC, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import mealApi, { Meal } from "src/services/mealApi";
import { Image } from "react-native";
import ConfirmationModal from "@components/ConfirmationModal";
import { RADIUS, SHADOWS } from "@utils/colors";

const PreviousMeals: FC = () => {
  const { token } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation<any>();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    fetchPreviousMeals();
  }, []);

  const fetchPreviousMeals = async () => {
    try {
      const result = await mealApi.getPreviousMeals(token!);
      if (result.success) {
        setMeals(result.data.meals);
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to fetch previous meals",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowConfirmModal(true);
  };

  const logMeal = async () => {
    if (!selectedMeal) return;
    const meal = selectedMeal;
    setShowConfirmModal(false);
    setLogging(meal.id);
    try {
      // We use createMeal instead of quickLog since we have the full meal object
      // but modified for today
      const result = await mealApi.createMeal(token!, {
        mealType: meal.mealType,
        description: meal.description,
        totalCalories: meal.totalCalories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        fiber: meal.fiber,
        mealDate: new Date().toISOString(),
        foodItems: meal.foodItems.map((item) => ({
          foodName: item.foodName,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
        })),
      });

      if (result.success) {
        showToast({
          message: `${meal.description || "Meal"} logged successfully!`,
          success: true,
          title: "Success",
          visible: true,
          duration: 2000,
        });
        navigation.navigate("MAIN_TABS");
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to log meal",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setLogging(null);
    }
  };

  const renderMealItem = ({ item }: { item: Meal }) => (
    <TouchableOpacity
      style={[
        styles.mealCard,
        { backgroundColor: theme.cardBackground },
        SHADOWS.small,
      ]}
      onPress={() => handleAddClick(item)}
      disabled={!!logging}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.mealImage} />
      )}
      <View style={styles.mealInfo}>
        <CustomText
          font="SemiBold"
          style={[styles.mealTitle, { color: theme.text.primary }]}
        >
          {item.description || "Unnamed Meal"}
        </CustomText>
        <CustomText
          font="Regular"
          style={[styles.mealDetails, { color: theme.text.secondary }]}
        >
          {item.foodItems.map((f) => f.foodName).join(", ")}
        </CustomText>
        <View style={styles.macroRow}>
          <View style={styles.macroTag}>
            <CustomText
              font="SemiBold"
              style={{ color: theme.primary, fontSize: RFValue(10) }}
            >
              {item.totalCalories} kcal
            </CustomText>
          </View>
          <CustomText
            font="Regular"
            style={[styles.macroText, { color: theme.text.secondary }]}
          >
            P: {item.protein || 0}g C: {item.carbs || 0}g F: {item.fats || 0}g
          </CustomText>
        </View>
      </View>
      <View style={styles.actionIcon}>
        {logging === item.id ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <MaterialCommunityIcons
            name="plus-circle"
            size={28}
            color={theme.primary}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons
            name="food-off"
            size={64}
            color={theme.text.secondary}
          />
          <CustomText
            font="Medium"
            style={{ color: theme.text.secondary, marginTop: 16 }}
          >
            No previous meals found
          </CustomText>
        </View>
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMealItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={{ marginBottom: 40 }}
        />
      )}

      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={logMeal}
        title="Add Previous Meal"
        message={`Are you sure you want to add "${selectedMeal?.description || "this meal"}" to today's log?`}
        confirmText="Add Meal"
        type="info"
        loading={!!logging}
      />
    </View>
  );
};

export default PreviousMeals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  mealCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
    marginRight: 12,
  },
  mealTitle: {
    fontSize: RFValue(14),
    marginBottom: 4,
  },
  mealDetails: {
    fontSize: RFValue(11),
    marginBottom: 8,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  macroTag: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  macroText: {
    fontSize: RFValue(10),
  },
  actionIcon: {
    width: 32,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
