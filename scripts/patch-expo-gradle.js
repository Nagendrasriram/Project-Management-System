const fs = require('fs');
const path = require('path');

// 1. Patch Expo build.gradle
const expoCandidates = [
  path.join(__dirname, '..', 'node_modules', 'expo', 'android', 'build.gradle'),
  path.join(__dirname, 'node_modules', 'expo', 'android', 'build.gradle'),
  path.join(process.cwd(), 'node_modules', 'expo', 'android', 'build.gradle'),
  path.join(process.cwd(), '..', 'node_modules', 'expo', 'android', 'build.gradle'),
  path.join(process.cwd(), 'mobile', 'node_modules', 'expo', 'android', 'build.gradle')
];

for (const p of expoCandidates) {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes("console.log(require('react-native/package.json').version);")) {
      content = content.replace(
        /def getRNVersion\(\) \{[\s\S]*?def version = safeExtGet\("reactNativeVersion", nodeModulesVersion\)/m,
        `def getRNVersion() {
  def rnVer = rootProject.ext.has("reactNativeVersion") ? rootProject.ext.get("reactNativeVersion") : "0.74.5"
  def version = safeExtGet("reactNativeVersion", rnVer)`
      );
      fs.writeFileSync(p, content, 'utf8');
      console.log('Successfully patched Expo Android build.gradle at:', p);
    }
  }
}

// 2. Patch react-native-screens build.gradle
const rnsCandidates = [
  path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'android', 'build.gradle'),
  path.join(__dirname, '..', 'mobile', 'node_modules', 'react-native-screens', 'android', 'build.gradle'),
  path.join(__dirname, 'node_modules', 'react-native-screens', 'android', 'build.gradle'),
  path.join(process.cwd(), 'node_modules', 'react-native-screens', 'android', 'build.gradle'),
  path.join(process.cwd(), 'mobile', 'node_modules', 'react-native-screens', 'android', 'build.gradle')
];

for (const p of rnsCandidates) {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    let modified = false;

    // Fix react-native location in monorepo
    if (!content.includes('reactNativeFromMonorepoRoot')) {
      content = content.replace(
        'def reactNativeFromProjectNodeModules = file("${rootProject.projectDir}/../node_modules/react-native")',
        `def reactNativeFromProjectNodeModules = file("\${rootProject.projectDir}/../node_modules/react-native")
    if (reactNativeFromProjectNodeModules.exists()) {
        return reactNativeFromProjectNodeModules
    }

    def reactNativeFromMonorepoRoot = file("\${rootProject.projectDir}/../../node_modules/react-native")
    if (reactNativeFromMonorepoRoot.exists()) {
        return reactNativeFromMonorepoRoot
    }`
      );
      modified = true;
    }

    // Fix compileSdkVersion fallback
    if (content.includes("compileSdkVersion safeExtGet('compileSdkVersion', rnsDefaultCompileSdkVersion)")) {
      content = content.replace(
        "compileSdkVersion safeExtGet('compileSdkVersion', rnsDefaultCompileSdkVersion)",
        "compileSdkVersion (rootProject.ext.has('compileSdkVersion') ? rootProject.ext.get('compileSdkVersion') : 34)"
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(p, content, 'utf8');
      console.log('Successfully patched react-native-screens build.gradle at:', p);
    }
  }
}
