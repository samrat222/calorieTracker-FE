import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "@screens/in-app/Dashboard";
import Profile from "@screens/in-app/Profile";
import Setting from "@screens/in-app/Setting";

const BottomTabs = createBottomTabNavigator<BottomStackParamList>();

const BottomTabsNavigator = () => {
  return (
    <BottomTabs.Navigator initialRouteName="HOME">
      <BottomTabs.Screen name="HOME" component={Dashboard} />
      <BottomTabs.Screen name="PROFILE" component={Profile} />
      <BottomTabs.Screen name="SETTING" component={Setting} />
    </BottomTabs.Navigator>
  );
};

export default BottomTabsNavigator;
