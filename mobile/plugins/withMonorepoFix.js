const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

function withMonorepoFix(config) {
  config = withProjectBuildGradle(config, (modConfig) => {
    let contents = modConfig.modResults.contents;
    if (!contents.includes('REACT_NATIVE_NODE_MODULES_DIR')) {
      const extBlock = `
ext {
    buildToolsVersion = findProperty('android.buildToolsVersion') ?: '34.0.0'
    minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '23')
    compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '34')
    targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '34')
    kotlinVersion = findProperty('android.kotlinVersion') ?: '1.9.23'
    REACT_NATIVE_NODE_MODULES_DIR = new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim()).getParentFile()
}
allprojects {
    ext {
        compileSdkVersion = 34
        targetSdkVersion = 34
        minSdkVersion = 23
        buildToolsVersion = "34.0.0"
    }
}
`;
      modConfig.modResults.contents = contents + extBlock;
    }
    return modConfig;
  });

  config = withAppBuildGradle(config, (modConfig) => {
    let contents = modConfig.modResults.contents;
    if (!contents.includes('REACT_NATIVE_NODE_MODULES_DIR')) {
      const appExtBlock = `
project.ext.set("REACT_NATIVE_NODE_MODULES_DIR", new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath())
`;
      modConfig.modResults.contents = contents + appExtBlock;
    }
    return modConfig;
  });

  return config;
}

module.exports = withMonorepoFix;
