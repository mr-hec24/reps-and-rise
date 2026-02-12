const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// https://github.com/supabase/supabase-js/issues/1258#issuecomment-2801695478
config.resolver = {
  ...config.resolver,
  unstable_conditionNames: ["browser"],
  unstable_enablePackageExports: false,
};

// Add network debugging for development
if (process.env.NODE_ENV === "development") {
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      ...config.transformer?.minifierConfig,
      keep_fnames: true,
    },
  };
}

module.exports = withNativeWind(config, { input: "./global.css" });
