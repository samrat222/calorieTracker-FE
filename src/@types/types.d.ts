type RootStackParamList = {
  LOGIN: undefined;
  REGISTER: { userId: string };
  PROFILE: undefined;
  SETTING: undefined;
  DASHBOARD: BottomStackParamList;
};

type BottomStackParamList = {
  HOME: undefined;
  SETTING: undefined;
  PROFILE: undefined;
};

type DrawerStackParamList = {
  DrawerScreen1: undefined;
  DrawerScreen2: undefined;
};

type font = {
  Regular: string;
  Medium: string;
  SemiBold: string;
  Bold: string;
};
