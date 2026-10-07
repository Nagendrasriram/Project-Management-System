const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, '..', '..', 'node_modules', 'expo', 'android', 'build.gradle'),
  path.join(__dirname, '..', 'node_modules', 'expo', 'android', 'build.gradle'),
  path.join(process.cwd(), 'node_modules', 'expo', 'android', 'build.gradle'),
  path.join(process.cwd(), '..', 'node_modules', 'expo', 'android', 'build.gradle')
];

let patched = false;
for (const p of candidates) {
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
      patched = true;
    }
  }
}

if (!patched) {
  console.log('Expo Android build.gradle was already patched or not found.');
}
