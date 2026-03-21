import React, { FC, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import analyticsApi, {
  DailyAnalytics,
  WeeklyAnalytics,
  MonthlyAnalytics,
} from "src/services/analyticsApi";
import mealApi from "src/services/mealApi";
import { RADIUS, SHADOWS } from "@utils/colors";
import SkeletonLoader from "@components/SkeletonLoader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_WIDTH = (SCREEN_WIDTH - 80) / 7;

type TabType = "daily" | "weekly" | "monthly";

const Analytics: FC = () => {
  const { token } = useAuth();
  const { theme, showToast } = useUI();

  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [dailyData, setDailyData] = useState<DailyAnalytics | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalytics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedDayMeals, setSelectedDayMeals] = useState<any[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!token) return;

    try {
      const [daily, weekly, monthly] = await Promise.all([
        analyticsApi.getDaily(token),
        analyticsApi.getWeekly(token),
        analyticsApi.getMonthly(token),
      ]);

      if (daily.success) setDailyData(daily.data);
      if (weekly.success) {
        setWeeklyData(weekly.data);
        // Initially select today or last day
        const todayStr = new Date().toISOString().split("T")[0];
        const index = weekly.data.dailyBreakdown.findIndex(
          (d: any) => d.date.split("T")[0] === todayStr,
        );
        const initialIndex =
          index !== -1 ? index : weekly.data.dailyBreakdown.length - 1;
        setSelectedDayIndex(initialIndex);
        if (weekly.data.dailyBreakdown[initialIndex]) {
          fetchDayMeals(weekly.data.dailyBreakdown[initialIndex].date);
        }
      }
      if (monthly.success) setMonthlyData(monthly.data);
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to load analytics",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDayMeals = async (date: string) => {
    if (!token) return;
    setMealsLoading(true);
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Use mealApi.getMeals
      const mealsResponse = await mealApi.getMeals(token, {
        startDate: date.split("T")[0],
        endDate: date.split("T")[0],
      });
      if (mealsResponse.success) {
        setSelectedDayMeals(mealsResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch day meals:", error);
    } finally {
      setMealsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [token]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    setAnimationKey((prev) => prev + 1);
    fetchAnalytics();
  };

  const renderTab = (tab: TabType, label: string) => (
    <Pressable
      key={tab}
      style={[
        styles.tab,
        {
          backgroundColor: activeTab === tab ? theme.primary : theme.surface,
          borderColor: activeTab === tab ? theme.primary : theme.inputBorder,
        },
        activeTab === tab && SHADOWS.small,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <CustomText
        font="SemiBold"
        style={{
          color: activeTab === tab ? "#fff" : theme.text.secondary,
          fontSize: RFValue(12),
        }}
      >
        {label}
      </CustomText>
    </Pressable>
  );

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case "under":
        return theme.green;
      case "over":
        return theme.red;
      case "on_track":
        return theme.primary;
      default:
        return theme.text.secondary;
    }
  };

  const renderDailyView = () => {
    if (!dailyData) return null;

    return (
      <View key={animationKey} style={styles.content}>
        {/* Today's Summary Card */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.cardHeader}>
            <CustomText
              font="SemiBold"
              style={[styles.cardTitle, { color: theme.text.primary }]}
            >
              Today's Progress
            </CustomText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(dailyData.status)}20` },
              ]}
            >
              <CustomText
                font="SemiBold"
                style={{
                  color: getStatusColor(dailyData.status),
                  fontSize: RFValue(10),
                }}
              >
                {dailyData.status === "on_track"
                  ? "On Track"
                  : dailyData.status === "under"
                    ? "Under Goal"
                    : "Over Goal"}
              </CustomText>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.inputTextFieldBorderColor },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(dailyData.percentConsumed, 100)}%`,
                    backgroundColor: getStatusColor(dailyData.status),
                  },
                ]}
              />
            </View>
            <CustomText
              font="SemiBold"
              style={{ color: theme.text.primary, fontSize: RFValue(14) }}
            >
              {dailyData.percentConsumed.toFixed(0)}%
            </CustomText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={{ color: theme.primary, fontSize: RFValue(20) }}
              >
                {dailyData.consumed}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Consumed
              </CustomText>
            </View>
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={{ color: theme.text.primary, fontSize: RFValue(20) }}
              >
                {dailyData.calorieGoal}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Goal
              </CustomText>
            </View>
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={{
                  color: dailyData.remaining >= 0 ? theme.green : theme.red,
                  fontSize: RFValue(20),
                }}
              >
                {Math.abs(dailyData.remaining)}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                {dailyData.remaining >= 0 ? "Remaining" : "Over"}
              </CustomText>
            </View>
          </View>
        </Animated.View>

        {/* Macros Card */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Macros Breakdown
          </CustomText>
          <View style={styles.macrosContainer}>
            <View style={styles.macroCircle}>
              <View
                style={[styles.macroCircleInner, { borderColor: "#FF6B6B" }]}
              >
                <CustomText
                  font="Bold"
                  style={{ color: theme.text.primary, fontSize: RFValue(16) }}
                >
                  {dailyData.macros.protein}g
                </CustomText>
              </View>
              <CustomText
                font="Regular"
                style={{
                  color: theme.text.secondary,
                  fontSize: RFValue(11),
                  marginTop: 8,
                }}
              >
                Protein
              </CustomText>
            </View>
            <View style={styles.macroCircle}>
              <View
                style={[styles.macroCircleInner, { borderColor: "#4ECDC4" }]}
              >
                <CustomText
                  font="Bold"
                  style={{ color: theme.text.primary, fontSize: RFValue(16) }}
                >
                  {dailyData.macros.carbs}g
                </CustomText>
              </View>
              <CustomText
                font="Regular"
                style={{
                  color: theme.text.secondary,
                  fontSize: RFValue(11),
                  marginTop: 8,
                }}
              >
                Carbs
              </CustomText>
            </View>
            <View style={styles.macroCircle}>
              <View
                style={[styles.macroCircleInner, { borderColor: "#FFE66D" }]}
              >
                <CustomText
                  font="Bold"
                  style={{ color: theme.text.primary, fontSize: RFValue(16) }}
                >
                  {dailyData.macros.fats}g
                </CustomText>
              </View>
              <CustomText
                font="Regular"
                style={{
                  color: theme.text.secondary,
                  fontSize: RFValue(11),
                  marginTop: 8,
                }}
              >
                Fats
              </CustomText>
            </View>
          </View>
        </Animated.View>

        {/* Message Card */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={[
            styles.messageCard,
            { backgroundColor: `${getStatusColor(dailyData.status)}15` },
          ]}
        >
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={24}
            color={getStatusColor(dailyData.status)}
          />
          <CustomText
            font="Regular"
            style={{
              color: theme.text.primary,
              fontSize: RFValue(13),
              flex: 1,
              marginLeft: 12,
            }}
          >
            {dailyData.message}
          </CustomText>
        </Animated.View>
      </View>
    );
  };

  const renderWeeklyView = () => {
    if (!weeklyData) return null;

    const maxCalories = Math.max(
      ...(weeklyData.dailyBreakdown || []).map((d) => d.totalCalories),
      1,
    );

    return (
      <View key={animationKey} style={styles.content}>
        {/* Weekly Chart */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Weekly Calories
          </CustomText>
          <View style={styles.chartContainer}>
            {(weeklyData.dailyBreakdown || []).map((day, index) => (
              <Pressable
                key={index}
                style={styles.barWrapper}
                onPress={() => {
                  setSelectedDayIndex(index);
                  fetchDayMeals(day.date);
                }}
              >
                <View
                  style={[
                    styles.barBackground,
                    {
                      backgroundColor: theme.inputTextFieldBorderColor,
                      borderColor:
                        selectedDayIndex === index
                          ? theme.primary
                          : "transparent",
                      borderWidth: selectedDayIndex === index ? 2 : 0,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max((day.totalCalories / maxCalories) * 100, 5)}%`,
                        backgroundColor:
                          selectedDayIndex === index
                            ? theme.primary
                            : "#FFA500",
                        opacity: selectedDayIndex === index ? 1 : 0.6,
                      },
                    ]}
                  />
                </View>
                <CustomText
                  font="Regular"
                  style={{
                    color:
                      selectedDayIndex === index
                        ? theme.primary
                        : theme.text.secondary,
                    fontSize: RFValue(10),
                    marginTop: 4,
                  }}
                >
                  {new Date(day.date)
                    .toLocaleDateString(undefined, { weekday: "short" })
                    .charAt(0)}
                </CustomText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Selected Day Meals */}
        {selectedDayIndex !== null && (
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <CustomText
                font="SemiBold"
                style={{ color: theme.text.primary, fontSize: RFValue(14) }}
              >
                Meals for{" "}
                {new Date(
                  weeklyData.dailyBreakdown[selectedDayIndex].date,
                ).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </CustomText>
              <CustomText
                font="Bold"
                style={{ color: theme.primary, fontSize: RFValue(14) }}
              >
                {weeklyData.dailyBreakdown[selectedDayIndex].totalCalories} kcal
              </CustomText>
            </View>

            {mealsLoading ? (
              <View style={{ paddingVertical: 20 }}>
                <SkeletonLoader width={"100%"} height={50} borderRadius={8} />
              </View>
            ) : selectedDayMeals.length > 0 ? (
              <View style={{ gap: 10 }}>
                {selectedDayMeals.map((meal, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 12,
                      backgroundColor: theme.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.inputBorder,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: `${theme.primary}20`,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          name={
                            meal.mealType === "breakfast"
                              ? "coffee-outline"
                              : meal.mealType === "lunch"
                                ? "food-outline"
                                : meal.mealType === "dinner"
                                  ? "food-variant"
                                  : "apple"
                          }
                          size={20}
                          color={theme.primary}
                        />
                      </View>
                      <View>
                        <CustomText
                          font="SemiBold"
                          style={{
                            color: theme.text.primary,
                            fontSize: RFValue(12),
                          }}
                        >
                          {meal.mealType.charAt(0).toUpperCase() +
                            meal.mealType.slice(1)}
                        </CustomText>
                        <CustomText
                          font="Regular"
                          style={{
                            color: theme.text.secondary,
                            fontSize: RFValue(10),
                          }}
                        >
                          {new Date(meal.mealDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CustomText>
                      </View>
                    </View>
                    <CustomText
                      font="Bold"
                      style={{
                        color: theme.text.primary,
                        fontSize: RFValue(12),
                      }}
                    >
                      {meal.totalCalories} kcal
                    </CustomText>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
                >
                  No meals logged for this day.
                </CustomText>
              </View>
            )}
          </Animated.View>
        )}

        {/* Weekly Stats */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            This Week
          </CustomText>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.primary, fontSize: RFValue(22) }}
              >
                {weeklyData.averageCalories.toFixed(0)}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Avg Calories
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.text.primary, fontSize: RFValue(22) }}
              >
                {weeklyData.totals.mealsCount}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Total Meals
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.green, fontSize: RFValue(22) }}
              >
                {weeklyData.daysTracked}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Days Tracked
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.orange, fontSize: RFValue(22) }}
              >
                {weeklyData.weeklyProgress.toFixed(0)}%
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Week Progress
              </CustomText>
            </View>
          </View>
        </Animated.View>

        {/* Macro Breakdown */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Macro Distribution
          </CustomText>
          <View style={styles.macroBreakdown}>
            <View style={styles.macroRow}>
              <View style={styles.macroLabel}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#FF6B6B" }]}
                />
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
                >
                  Protein
                </CustomText>
              </View>
              <CustomText
                font="SemiBold"
                style={{ color: theme.text.primary, fontSize: RFValue(12) }}
              >
                {weeklyData.macroBreakdown.proteinPercentage.toFixed(0)}%
              </CustomText>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroLabel}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#4ECDC4" }]}
                />
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
                >
                  Carbs
                </CustomText>
              </View>
              <CustomText
                font="SemiBold"
                style={{ color: theme.text.primary, fontSize: RFValue(12) }}
              >
                {weeklyData.macroBreakdown.carbsPercentage.toFixed(0)}%
              </CustomText>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroLabel}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#FFE66D" }]}
                />
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
                >
                  Fats
                </CustomText>
              </View>
              <CustomText
                font="SemiBold"
                style={{ color: theme.text.primary, fontSize: RFValue(12) }}
              >
                {weeklyData.macroBreakdown.fatsPercentage.toFixed(0)}%
              </CustomText>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderMonthlyView = () => {
    if (!monthlyData) return null;

    return (
      <View key={animationKey} style={styles.content}>
        {/* Monthly Summary */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Monthly Overview
          </CustomText>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.primary, fontSize: RFValue(22) }}
              >
                {monthlyData.averageCalories.toFixed(0)}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Avg Calories
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.text.primary, fontSize: RFValue(22) }}
              >
                {monthlyData.totals.mealsCount}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Total Meals
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.green, fontSize: RFValue(22) }}
              >
                {monthlyData.daysTracked}/{monthlyData.daysInMonth}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Days Tracked
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.orange, fontSize: RFValue(22) }}
              >
                {monthlyData.consistencyScore}%
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Consistency
              </CustomText>
            </View>
          </View>
        </Animated.View>

        {/* Weekly Trends */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Weekly Trends
          </CustomText>
          {(monthlyData.weeklyTrends || []).map((week, index) => (
            <View key={index} style={styles.weekRow}>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
              >
                Week {week.week}
              </CustomText>
              <View style={styles.weekStats}>
                <CustomText
                  font="SemiBold"
                  style={{ color: theme.primary, fontSize: RFValue(12) }}
                >
                  {week.averageCalories.toFixed(0)} cal/day
                </CustomText>
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
                >
                  {week.mealsCount} meals
                </CustomText>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Average Macros */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Average Daily Macros
          </CustomText>
          <View style={styles.avgMacros}>
            <View style={styles.avgMacroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#FF6B6B", fontSize: RFValue(18) }}
              >
                {monthlyData.averageMacros.protein.toFixed(0)}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Protein
              </CustomText>
            </View>
            <View style={styles.avgMacroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#4ECDC4", fontSize: RFValue(18) }}
              >
                {monthlyData.averageMacros.carbs.toFixed(0)}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Carbs
              </CustomText>
            </View>
            <View style={styles.avgMacroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#FFE66D", fontSize: RFValue(18) }}
              >
                {monthlyData.averageMacros.fats.toFixed(0)}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Fats
              </CustomText>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTab("daily", "Daily")}
        {renderTab("weekly", "Weekly")}
        {renderTab("monthly", "Monthly")}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <View style={styles.skeletonContent}>
            <SkeletonLoader
              width={"100%"}
              height={180}
              borderRadius={RADIUS.lg}
            />
            <View style={{ height: 16 }} />
            <SkeletonLoader
              width={"100%"}
              height={140}
              borderRadius={RADIUS.lg}
            />
            <View style={{ height: 16 }} />
            <SkeletonLoader
              width={"100%"}
              height={200}
              borderRadius={RADIUS.lg}
            />
          </View>
        </View>
      ) : (
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
          {activeTab === "daily" && renderDailyView()}
          {activeTab === "weekly" && renderWeeklyView()}
          {activeTab === "monthly" && renderMonthlyView()}
        </ScrollView>
      )}
    </View>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: RFValue(14),
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroCircle: {
    alignItems: "center",
  },
  macroCircleInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    paddingTop: 16,
  },
  barWrapper: {
    alignItems: "center",
  },
  barBackground: {
    width: BAR_WIDTH - 8,
    height: 120,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    paddingVertical: 12,
  },
  macroBreakdown: {
    gap: 12,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  weekStats: {
    alignItems: "flex-end",
  },
  avgMacros: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  avgMacroItem: {
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContent: {
    width: "100%",
    padding: 16,
  },
});
