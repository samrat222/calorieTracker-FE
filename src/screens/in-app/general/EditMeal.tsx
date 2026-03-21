import React, { FC, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useRef } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import CustomButton from "@components/CustomButton";
import CustomInputTextField from "@components/CustomInputTextField";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import mealApi, { FoodItem, MealType, Meal } from "src/services/mealApi";
import { compressImage } from "@utils/imageUtils";
import ConfirmationModal from "@components/ConfirmationModal";

const MEAL_TYPES: {
  type: MealType;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    type: "breakfast",
    label: "Breakfast",
    icon: "weather-sunset-up",
    color: "#FF9F43",
  },
  { type: "lunch", label: "Lunch", icon: "weather-sunny", color: "#00D2D3" },
  { type: "dinner", label: "Dinner", icon: "weather-night", color: "#5F27CD" },
  { type: "snack", label: "Snack", icon: "cookie", color: "#EE5253" },
];

const EditMeal: FC = () => {
  const { token } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mealId } = route.params;
  const scrollViewRef = useRef<any>(null);
  const newItemRef = useRef<any>(null);

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("breakfast");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (newlyAddedId && newItemRef.current) {
      newItemRef.current.focus();
      setNewlyAddedId(null);
    }
  }, [newlyAddedId]);

  useEffect(() => {
    fetchMeal();
  }, [mealId]);

  const fetchMeal = async () => {
    if (!token || !mealId) return;

    try {
      const response = await mealApi.getMealById(token, mealId);
      if (response.success) {
        const meal: Meal = response.data.meal;
        setSelectedMealType(meal.mealType);
        setDescription(meal.description || "");
        setFoodItems(meal.foodItems || []);
        setExistingImageUrl(meal.imageUrl || null);
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to load meal",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return foodItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (Number(item.calories) || 0),
        protein: acc.protein + (Number(item.protein) || 0),
        carbs: acc.carbs + (Number(item.carbs) || 0),
        fats: acc.fats + (Number(item.fats) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );
  };

  const handleAddFoodItem = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const id = `new-${Date.now()}`;
    setFoodItems((prev) => [
      ...prev,
      {
        id,
        foodName: "",
        quantity: 1,
        unit: "serving",
        calories: 0,
      },
    ]);
    setNewlyAddedId(id);

    // Scroll to bottom after state update
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleUpdateFoodItem = (index: number, updates: Partial<FoodItem>) => {
    const newList = [...foodItems];
    newList[index] = { ...newList[index], ...updates };
    setFoodItems(newList);
  };

  const handleRemoveFoodItem = (index: number) => {
    setItemToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDeleteIndex !== null) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setFoodItems(foodItems.filter((_, i) => i !== itemToDeleteIndex));
      setItemToDeleteIndex(null);
    }
    setShowDeleteModal(false);
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const compressed = await compressImage(result.assets[0].uri);
      setImageUri(compressed ? compressed.uri : result.assets[0].uri);
      setExistingImageUrl(null);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const compressed = await compressImage(result.assets[0].uri);
      setImageUri(compressed ? compressed.uri : result.assets[0].uri);
      setExistingImageUrl(null);
    }
  };

  const handleUpdate = async () => {
    if (!token || !mealId) return;

    // Validate food items
    const invalidItems = foodItems.some(
      (item) => !item.foodName.trim() || Number(item.calories) < 0,
    );
    if (invalidItems) {
      showToast({
        message: "Please ensure all food items have a name and valid calories",
        success: false,
        title: "Validation Error",
        visible: true,
        duration: 3000,
      });
      return;
    }

    setSaving(true);
    try {
      const totals = calculateTotals();
      const payload = {
        mealType: selectedMealType,
        description: description.trim(),
        foodItems: foodItems.map((item) => ({
          foodName: item.foodName,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
        })),
        totalCalories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats,
      };

      const result = await mealApi.updateMeal(
        token,
        mealId,
        payload,
        imageUri || undefined,
      );

      if (result.success) {
        showToast({
          message: "Meal updated successfully!",
          success: true,
          title: "Success",
          visible: true,
          duration: 2000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to update meal",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={20}
    >
      {/* Meal Type Selector */}
      <CustomText
        font="SemiBold"
        style={[styles.sectionTitle, { color: theme.text.primary }]}
      >
        Meal Type
      </CustomText>
      <View style={styles.mealTypeContainer}>
        {MEAL_TYPES.map((meal) => (
          <TouchableOpacity
            key={meal.type}
            style={[
              styles.mealTypeButton,
              {
                backgroundColor:
                  selectedMealType === meal.type
                    ? `${meal.color}20`
                    : theme.cardBackground,
                borderColor:
                  selectedMealType === meal.type ? meal.color : "transparent",
              },
            ]}
            onPress={() => setSelectedMealType(meal.type)}
          >
            <MaterialCommunityIcons
              name={meal.icon as any}
              size={24}
              color={
                selectedMealType === meal.type
                  ? meal.color
                  : theme.text.secondary
              }
            />
            <CustomText
              font="Regular"
              style={{
                color:
                  selectedMealType === meal.type
                    ? meal.color
                    : theme.text.secondary,
                fontSize: RFValue(11),
                marginTop: 4,
              }}
            >
              {meal.label}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Image Upload */}
      <CustomText
        font="SemiBold"
        style={[
          styles.sectionTitle,
          { color: theme.text.primary, marginTop: 24 },
        ]}
      >
        Food Image
      </CustomText>
      <View style={styles.imageSection}>
        {imageUri || existingImageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri || existingImageUrl! }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={[styles.removeImageButton, { backgroundColor: theme.red }]}
              onPress={() => {
                setImageUri(null);
                setExistingImageUrl(null);
              }}
            >
              <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={takePhoto}
            >
              <MaterialCommunityIcons
                name="camera"
                size={32}
                color={theme.primary}
              />
              <CustomText
                font="Regular"
                style={[styles.uploadText, { color: theme.text.secondary }]}
              >
                Take Photo
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={pickImage}
            >
              <MaterialCommunityIcons
                name="image"
                size={32}
                color={theme.primary}
              />
              <CustomText
                font="Regular"
                style={[styles.uploadText, { color: theme.text.secondary }]}
              >
                Gallery
              </CustomText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Food Items */}
      <View style={{ marginTop: 24 }}>
        <View style={styles.rowBetween}>
          <CustomText
            font="SemiBold"
            style={[
              styles.sectionTitle,
              { color: theme.text.primary, marginBottom: 0 },
            ]}
          >
            Food Items
          </CustomText>
          <TouchableOpacity
            onPress={handleAddFoodItem}
            style={styles.addButton}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={theme.primary}
            />
            <CustomText
              font="SemiBold"
              style={{ color: theme.primary, fontSize: RFValue(12) }}
            >
              Add Item
            </CustomText>
          </TouchableOpacity>
        </View>

        {foodItems.map((item, index) => (
          <View
            key={item.id || index}
            style={[
              styles.foodItemCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.foodItemHeader}>
              <View style={{ flex: 1 }}>
                <CustomInputTextField
                  ref={item.id === newlyAddedId ? newItemRef : null}
                  label=""
                  placeholder="Food Name"
                  value={item.foodName}
                  onChangeText={(val) =>
                    handleUpdateFoodItem(index, { foodName: val })
                  }
                />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveFoodItem(index)}
                style={styles.deleteIconButton}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color={theme.red}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.foodItemBody}>
              <View style={{ flex: 1.5 }}>
                <CustomInputTextField
                  label="Qty"
                  placeholder="e.g., 1"
                  value={item.quantity.toString()}
                  keyboardType="numeric"
                  onChangeText={(val) =>
                    handleUpdateFoodItem(index, {
                      quantity: Number(val) || 0,
                    })
                  }
                />
              </View>
              <View style={{ flex: 2 }}>
                <CustomInputTextField
                  label="Unit"
                  placeholder="e.g., serving"
                  value={item.unit}
                  onChangeText={(val) =>
                    handleUpdateFoodItem(index, { unit: val })
                  }
                />
              </View>
              <View style={{ flex: 2 }}>
                <CustomInputTextField
                  label="Kcal"
                  placeholder="0"
                  value={item.calories.toString()}
                  keyboardType="numeric"
                  onChangeText={(val) =>
                    handleUpdateFoodItem(index, {
                      calories: Number(val) || 0,
                    })
                  }
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Total Summary */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.primary + "10",
            borderColor: theme.primary,
          },
        ]}
      >
        <CustomText
          font="Bold"
          style={{ color: theme.primary, fontSize: RFValue(16) }}
        >
          Review Total
        </CustomText>
        <View style={styles.rowBetween}>
          <CustomText font="SemiBold" style={{ color: theme.text.secondary }}>
            Total Calories
          </CustomText>
          <CustomText
            font="Bold"
            style={{ color: theme.text.primary, fontSize: RFValue(16) }}
          >
            {calculateTotals().calories} kcal
          </CustomText>
        </View>
      </View>

      {/* Description */}
      <View style={{ marginTop: 24 }}>
        <CustomInputTextField
          label="Additional Notes"
          placeholder="e.g., Chicken salad with olive oil dressing"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <CustomButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ flex: 1 }}
        />
        <CustomButton
          title={saving ? "Saving Changes..." : "Update Meal"}
          onPress={handleUpdate}
          loading={saving}
          style={{ flex: 1 }}
        />
      </View>
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Remove Item"
        message="Are you sure you want to remove this food item?"
        confirmText="Remove"
        type="danger"
      />
    </KeyboardAwareScrollView>
  );
};

export default EditMeal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: RFValue(14),
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  imageSection: {
    width: "100%",
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
  },
  uploadText: {
    fontSize: RFValue(12),
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    marginRight: -8,
  },
  foodItemCard: {
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  foodItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteIconButton: {
    padding: 4,
  },
  foodItemBody: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    marginBottom: 40,
  },
});
