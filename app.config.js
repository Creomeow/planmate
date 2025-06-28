export default {
  expo: {
    name: "PlanMate",
    slug: "PlanMate",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "planmate",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      openaiApiKey: "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",
    },
  }
}; 