import { registerRootComponent } from "expo";

import App from "./src/App";
import { startNetworkLogging } from "react-native-network-logger";
import { BUILD_FOR_PRODUCTION } from "./src/constants/constants";

!BUILD_FOR_PRODUCTION && startNetworkLogging();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
