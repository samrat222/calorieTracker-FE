import {
  createNavigationContainerRef,
  NavigationContainerRef,
} from "@react-navigation/native";

export const getFontName = (font: keyof font) => {
  switch (font) {
    case "Regular":
      return "WorkSans_400Regular";

    case "Medium":
      return "WorkSans_500Medium";

    case "SemiBold":
      return "WorkSans_600SemiBold";

    case "Bold":
      return "WorkSans_700Bold";

    default:
      return "WorkSans_400Regular";
  }
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const getNavigation = (): NavigationContainerRef<RootStackParamList> => {
    if (!navigationRef.isReady()) {
        // throw new Error("Navigation is not ready yet.");
        console.log('Navigation is getting prepared')
    }
    return navigationRef;
  };
