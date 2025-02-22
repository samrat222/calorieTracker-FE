import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  useColorScheme,
  ColorSchemeName,
  ActivityIndicator,
} from "react-native";
import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from "react";
import { CheckCircle, CircleAlert, Cross } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { THEME } from "../utils/colors";

interface ToastMessageProps {
  visible?: boolean;
  theme?: (typeof THEME)[ThemeMode] ;
  success: boolean;
  title: string;
  message: string;
  duration?: number;
  onClose?: any;
  canClose?: boolean;
}

type ThemeMode = "light" | "dark";

interface UIContextType {
  theme: (typeof THEME)[ThemeMode];
  setAppTheme: React.Dispatch<React.SetStateAction<ColorSchemeName>>;
  fullscreenLoading: boolean;
  setFullscreenLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: React.Dispatch<React.SetStateAction<ToastMessageProps>>;
}

const ToastMessage: FC<ToastMessageProps> = ({
  visible = true,
  theme,
  success,
  title,
  message,
  duration = 1200,
  onClose,
  canClose = false,
}) => {
  useEffect(() => {
    if (visible && !canClose) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      onRequestClose={canClose ? onClose : null}
      animationType="fade"
      transparent
      visible={visible}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.68)",
        }}
      >
        <TouchableOpacity
          style={{}}
          onPress={canClose ? onClose : null}
          activeOpacity={canClose ? 0.7 : 1}
        >
          <View
            style={{
              width: 340,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme?.background,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 5,
              marginHorizontal: 40,
              marginBottom: 40,
              borderLeftWidth: 6,
              borderLeftColor: "#2980b9",
            }}
          >
            {canClose && (
              <Cross
                size={12}
                style={{ position: "absolute", right: 10, top: 10 }}
                onPress={onClose}
              />
            )}
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 40,
                backgroundColor: theme?.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {success ? (
                <CheckCircle size={16} />
              ) : (
                <CircleAlert size={16} color={theme?.red} />
              )}
            </View>
            <View
              style={{
                paddingLeft: 12,
                width: 240,
              }}
            >
              <View>
                <Text
                  style={{
                    color: theme?.text.primary,
                    fontFamily: "NunitoSans_400Regular",
                    fontSize: RFValue(14),
                    marginBottom: 4,
                  }}
                >
                  {title}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: theme?.text.secondary,
                    fontFamily: "NunitoSans_300Light",
                    fontSize: RFValue(12),
                  }}
                >
                  {message}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const FullscreenLoader = ({ show }: { show: boolean }) => {
  const {theme} = useUI();
  return (
    <Modal animationType="fade" transparent visible={show}>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.68)",
        }}
      >
        <ActivityIndicator size={"large"} color={theme.primary} />
      </View>
    </Modal>
  );
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UiProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceTheme = useColorScheme();
  const [appTheme, setAppTheme] = useState<ColorSchemeName>(deviceTheme);
  const [fullscreenLoading, setFullscreenLoading] = useState<boolean>(false);
  const theme = THEME[appTheme || "light"];
  const [toast, showToast] = useState<ToastMessageProps>({
    visible: false,
    theme,
    success: true,
    title: "",
    message: "",
    duration: 0,
    onClose: () => {},
    canClose: false,
  });


  useEffect(() => {
    setAppTheme(deviceTheme);
  }, [deviceTheme]);

  return (
    <UIContext.Provider
      value={{
        theme,
        setAppTheme,
        fullscreenLoading,
        setFullscreenLoading,
        showToast,
      }}
    >
      {children}
      <FullscreenLoader show={fullscreenLoading} />
      <ToastMessage
        theme={theme}
        visible={toast.visible}
        success={toast.success}
        title={toast.title}
        message={toast.message}
        duration={toast.duration}
        canClose={toast.canClose}
        onClose={() => {
          showToast({
            ...toast,
            visible: false,
          });
          toast.onClose && toast.onClose();
        }}
      />
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIContext");
  }
  return context;
};
