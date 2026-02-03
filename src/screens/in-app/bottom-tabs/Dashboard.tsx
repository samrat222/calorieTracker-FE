/**
 * Dashboard Screen
 * Swiggy-styled home screen with animations
 */

import React, { FC, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalorieRing from "@components/CalorieRing";
import MealCard from "@components/MealCard";
import MacroBar from "@components/MacroBar";
import mealApi, { Meal, MealType } from "src/services/mealApi";
import * as SecureStore from "expo-secure-store";
import { RADIUS, SHADOWS } from "@utils/colors";
import { SkeletonDashboard } from "@components/SkeletonLoader";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Quick action data
const QUICK_ACTIONS: {
  type: MealType;
  name: string;
  icon: string;
  color: string;
}[] = [
  {
    type: "breakfast",
    name: "Breakfast",
    icon: "weather-sunset-up",
    color: "#FF9F43",
  },
  { type: "lunch", name: "Lunch", icon: "weather-sunny", color: "#00D2D3" },
  { type: "dinner", name: "Dinner", icon: "weather-night", color: "#5F27CD" },
  { type: "snack", name: "Snack", icon: "cookie", color: "#EE5253" },
];

const Dashboard: FC = () => {
  const { token, profile } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(!profile);
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); // Key to re-trigger animations
  const [meals, setMeals] = useState<Meal[]>([]);
  const [summary, setSummary] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealsCount: 0,
  });
  const [goal, setGoal] = useState(profile?.dailyCalorieGoal || 2000);
  const remainingCalories = Math.max(0, goal - summary.totalCalories);
  const progressPercent =
    goal > 0
      ? Math.min(100, Math.round((summary.totalCalories / goal) * 100))
      : 0;

  // FAB animation
  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const loadCachedData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const [cachedSummary, cachedMeals] = await Promise.all([
        SecureStore.getItemAsync("todays_summary"),
        SecureStore.getItemAsync("todays_meals"),
      ]);

      if (cachedSummary) {
        const parsedSummary = JSON.parse(cachedSummary);
        if (parsedSummary.date === today) {
          setSummary(parsedSummary.data);
          setGoal(parsedSummary.goal || profile?.dailyCalorieGoal || 2000);
          setLoading(false);
        }
      }

      if (cachedMeals) {
        const parsedMeals = JSON.parse(cachedMeals);
        if (parsedMeals.date === today) {
          setMeals(parsedMeals.data);
        }
      }
    } catch (error) {
      console.error("Error loading cached dashboard data:", error);
    }
  };

  const fetchTodaysMeals = async (isBackground = false) => {
    if (!token) return;
    if (!isBackground && !meals.length) setLoading(true);

    try {
      const response = await mealApi.getTodaysMeals(token);
      if (response.success) {
        const data = response.data;
        const today = new Date().toISOString().split("T")[0];

        setMeals(data?.meals || []);
        setSummary({
          totalCalories: data?.totals?.totalCalories || 0,
          totalProtein: data?.totals?.totalProtein || 0,
          totalCarbs: data?.totals?.totalCarbs || 0,
          totalFats: data?.totals?.totalFats || 0,
          mealsCount: data?.mealsCount || 0,
        });
        setGoal(data?.goal || profile?.dailyCalorieGoal || 2000);

        // Cache data
        await Promise.all([
          SecureStore.setItemAsync(
            "todays_summary",
            JSON.stringify({
              date: today,
              data: {
                totalCalories: data?.totals?.totalCalories || 0,
                totalProtein: data?.totals?.totalProtein || 0,
                totalCarbs: data?.totals?.totalCarbs || 0,
                totalFats: data?.totals?.totalFats || 0,
                mealsCount: data?.mealsCount || 0,
              },
              goal: data?.goal || profile?.dailyCalorieGoal || 2000,
            }),
          ),
          SecureStore.setItemAsync(
            "todays_meals",
            JSON.stringify({
              date: today,
              data: data?.meals || [],
            }),
          ),
        ]);
      }
    } catch (error: any) {
      if (!isBackground) {
        showToast({
          message: error.message || "Failed to load meals",
          success: false,
          title: "Error",
          visible: true,
          duration: 3000,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCachedData();
      fetchTodaysMeals(true);
    }, [token]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    setAnimationKey((prev) => prev + 1); // Increment to re-trigger animations
    fetchTodaysMeals();
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night";
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const handleQuickAction = (type: MealType) => {
    navigation.navigate("ADD_MEAL", { mealType: type });
  };

  const renderQuickAction = (
    action: (typeof QUICK_ACTIONS)[0],
    index: number,
  ) => (
    <Animated.View
      key={action.type}
      entering={FadeInDown.delay(100 * index).springify()}
    >
      <Pressable
        style={[
          styles.quickAction,
          { backgroundColor: theme.cardBackground },
          SHADOWS.small,
        ]}
        onPress={() => handleQuickAction(action.type)}
      >
        <View
          style={[
            styles.quickActionIcon,
            { backgroundColor: `${action.color}15` },
          ]}
        >
          <MaterialCommunityIcons
            name={action.icon as any}
            size={24}
            color={action.color}
          />
        </View>
        <CustomText
          font="Medium"
          style={[styles.quickActionText, { color: theme.text.primary }]}
        >
          {action.name}
        </CustomText>
      </Pressable>
    </Animated.View>
  );

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        pointerEvents="none"
        style={[
          styles.decorCirclePrimary,
          { backgroundColor: theme.primaryLight },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.decorCircleSecondary,
          { backgroundColor: theme.surface },
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Header */}
        <Animated.View
          key={`header-${animationKey}`}
          style={styles.header}
          entering={FadeInDown.delay(50).springify()}
        >
          <View>
            <CustomText
              font="Regular"
              style={[styles.greeting, { color: theme.text.secondary }]}
            >
              {greeting()}
            </CustomText>
            <CustomText
              font="Bold"
              style={[styles.userName, { color: theme.text.primary }]}
            >
              {profile?.name || "User"}
            </CustomText>
            <View style={styles.headerMetaRow}>
              <View
                style={[
                  styles.headerChip,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <CustomText
                  font="Medium"
                  style={[styles.headerChipText, { color: theme.primary }]}
                >
                  Today
                </CustomText>
              </View>
              <CustomText
                font="Regular"
                style={[styles.headerHint, { color: theme.text.tertiary }]}
              >
                {progressPercent}% of goal
              </CustomText>
            </View>
          </View>
          <Pressable
            style={[
              styles.historyButton,
              { backgroundColor: theme.surface },
              SHADOWS.small,
            ]}
            onPress={() => navigation.navigate("MEAL_HISTORY")}
          >
            <MaterialCommunityIcons
              name="history"
              size={22}
              color={theme.text.primary}
            />
          </Pressable>
        </Animated.View>

        {/* Calorie Progress Card */}
        <Animated.View
          key={`progress-${animationKey}`}
          style={[
            styles.progressCard,
            { backgroundColor: theme.cardBackground },
            SHADOWS.medium,
          ]}
          entering={FadeInDown.delay(100).springify()}
        >
          <View
            pointerEvents="none"
            style={[
              styles.progressGlow,
              { backgroundColor: theme.primaryLight },
            ]}
          />
          <View style={styles.progressHeader}>
            <CustomText
              font="SemiBold"
              style={[styles.progressTitle, { color: theme.text.primary }]}
            >
              Today's Progress
            </CustomText>
            <View
              style={[
                styles.goalBadge,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <CustomText
                font="Medium"
                style={[styles.goalBadgeText, { color: theme.primary }]}
              >
                {goal} kcal
              </CustomText>
            </View>
          </View>
          <CustomText
            font="Regular"
            style={[styles.progressSubtitle, { color: theme.text.secondary }]}
          >
            {summary.totalCalories} consumed · {remainingCalories} remaining
          </CustomText>

          <View style={styles.ringContainer}>
            <CalorieRing
              consumed={summary.totalCalories}
              goal={goal}
              size={160}
            />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
              <CustomText
                font="Bold"
                style={[styles.statValue, { color: theme.primary }]}
              >
                {summary.totalCalories}
              </CustomText>
              <CustomText
                font="Regular"
                style={[styles.statLabel, { color: theme.text.secondary }]}
              >
                Consumed
              </CustomText>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
              <CustomText
                font="Bold"
                style={[styles.statValue, { color: theme.success }]}
              >
                {remainingCalories}
              </CustomText>
              <CustomText
                font="Regular"
                style={[styles.statLabel, { color: theme.text.secondary }]}
              >
                Remaining
              </CustomText>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
              <CustomText
                font="Bold"
                style={[styles.statValue, { color: theme.text.primary }]}
              >
                {summary.mealsCount}
              </CustomText>
              <CustomText
                font="Regular"
                style={[styles.statLabel, { color: theme.text.secondary }]}
              >
                Meals
              </CustomText>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          key={`quick-${animationKey}`}
          entering={FadeInDown.delay(150).springify()}
        >
          <View style={styles.sectionHeader}>
            <CustomText
              font="SemiBold"
              style={[styles.sectionTitle, { color: theme.text.primary }]}
            >
              Quick Add
            </CustomText>
            <CustomText
              font="Regular"
              style={[styles.sectionHint, { color: theme.text.tertiary }]}
            >
              Tap to log
            </CustomText>
          </View>
          <View
            style={[
              styles.quickActionsCard,
              { backgroundColor: theme.cardBackground },
              SHADOWS.small,
            ]}
          >
            <View style={styles.quickActionsRow}>
              {QUICK_ACTIONS.map((action, index) =>
                renderQuickAction(action, index),
              )}
            </View>
          </View>
        </Animated.View>

        {/* Macros Card */}
        <Animated.View
          key={`macros-${animationKey}`}
          style={[
            styles.macrosCard,
            { backgroundColor: theme.cardBackground },
            SHADOWS.small,
          ]}
          entering={FadeInDown.delay(200).springify()}
        >
          <View style={styles.sectionHeader}>
            <CustomText
              font="SemiBold"
              style={[styles.cardTitle, { color: theme.text.primary }]}
            >
              Today's Macros
            </CustomText>
            <CustomText
              font="Regular"
              style={[styles.sectionHint, { color: theme.text.tertiary }]}
            >
              Protein · Carbs · Fats
            </CustomText>
          </View>
          <MacroBar
            protein={summary.totalProtein}
            carbs={summary.totalCarbs}
            fats={summary.totalFats}
          />
        </Animated.View>

        {/* Meals Section */}
        <Animated.View
          key={`meals-${animationKey}`}
          style={styles.mealsSection}
          entering={FadeInDown.delay(250).springify()}
        >
          <View style={styles.sectionHeader}>
            <CustomText
              font="SemiBold"
              style={[styles.sectionTitle, { color: theme.text.primary }]}
            >
              Today's Meals
            </CustomText>
            <CustomText
              font="Medium"
              style={[styles.mealCount, { color: theme.text.tertiary }]}
            >
              {summary.mealsCount} {summary.mealsCount === 1 ? "meal" : "meals"}
            </CustomText>
          </View>

          {meals.length === 0 ? (
            <View
              style={[styles.emptyState, { backgroundColor: theme.surface }]}
            >
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <MaterialCommunityIcons
                  name="food-variant"
                  size={40}
                  color={theme.primary}
                />
              </View>
              <CustomText
                font="SemiBold"
                style={[styles.emptyText, { color: theme.text.primary }]}
              >
                No meals logged today
              </CustomText>
              <CustomText
                font="Regular"
                style={[styles.emptySubtext, { color: theme.text.secondary }]}
              >
                Use the quick actions above or tap the + button to add your
                first meal
              </CustomText>
            </View>
          ) : (
            meals.map((meal, index) => (
              <Animated.View
                key={meal.id}
                entering={FadeInDown.delay(300 + index * 50).springify()}
              >
                <MealCard
                  meal={meal}
                  onPress={() =>
                    navigation.navigate("MEAL_DETAIL", { mealId: meal.id })
                  }
                />
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Add Button */}
      <AnimatedPressable
        style={[
          styles.fab,
          { backgroundColor: theme.primary },
          SHADOWS.large,
          fabAnimatedStyle,
        ]}
        onPress={() => navigation.navigate("ADD_MEAL")}
        onPressIn={() => {
          fabScale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1);
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </AnimatedPressable>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorCirclePrimary: {
    position: "absolute",
    top: -60,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.7,
  },
  decorCircleSecondary: {
    position: "absolute",
    top: 140,
    left: -90,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: RFValue(13),
    marginBottom: 2,
  },
  userName: {
    fontSize: RFValue(22),
  },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  headerChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginRight: 8,
  },
  headerChipText: {
    fontSize: RFValue(11),
  },
  headerHint: {
    fontSize: RFValue(11),
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCard: {
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressGlow: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: RFValue(16),
  },
  goalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  goalBadgeText: {
    fontSize: RFValue(12),
  },
  progressSubtitle: {
    fontSize: RFValue(12),
    marginBottom: 10,
  },
  ringContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: RFValue(18),
    marginBottom: 2,
  },
  statLabel: {
    fontSize: RFValue(11),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: RFValue(11),
  },
  quickActionsCard: {
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
    padding: 12,
    borderRadius: RADIUS.lg,
    width: 74,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: RFValue(10),
  },
  macrosCard: {
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: RFValue(14),
  },
  sectionTitle: {
    fontSize: RFValue(15),
  },
  mealsSection: {
    flex: 1,
    marginTop: 8,
  },
  mealCount: {
    fontSize: RFValue(12),
  },
  emptyState: {
    padding: 32,
    borderRadius: RADIUS.lg,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: RFValue(15),
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: RFValue(12),
    textAlign: "center",
    lineHeight: RFValue(18),
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
