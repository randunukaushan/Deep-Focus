# Android debug build evidence — 2026-10-09

මෙය local Android debug build එකේ සාක්ෂියකි. මෙයින් device runtime, security
review හෝ release readiness තහවුරු නොවේ.

## කළ පරීක්ෂාව

- ක්‍රියාත්මක කළේ: `android\gradlew.bat assembleDebug --no-daemon --offline`
- ප්‍රතිඵලය: `BUILD SUCCESSFUL`
- Gradle ක්‍රියා: `662 actionable tasks: 55 executed, 607 up-to-date`
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- ප්‍රමාණය: `257,075,010` bytes
- SHA-256: `DDC962AA52232D9D2FA825DB68F53C62E91E7EB0C4DB481BEBA84855101BA2DC`

මෙම build එක auth runtime locale-copy, onboarding assessment accessibility,
home accessibility locale, settings accessibility locale, auth callback
accessibility locale, focus setup accessibility locale, teacher assignment
saving-copy locale, onboarding profile safe-error locale, assessment flow
safe-error locale, password recovery locale සහ Home duration-unit locale
slices නවයෙන් පසුව
නැවත සාර්ථකව සාදා ඇත. අවසන් run එකේදීම
`BUILD SUCCESSFUL`
වූ අතර `662 actionable tasks: 55 executed, 607 up-to-date` ලැබුණි.

Build එක සඳහා source files, lockfile, dependency versions හෝ provider settings
වෙනස් කර නැත. SDK XML compatibility notice, NODE_ENV notice සහ පවතින Gradle
deprecation warnings තිබුණත් build එක අසාර්ථක වූයේ නැත.

## තවම නොකළ දේ

නැවත `adb devices -l` ධාවනය කළ විට `List of devices attached` යටතේ කිසිදු
device/emulator එකක් නොපෙන්වුණි. ඒ නිසා APK install කිරීම, app launch කිරීම, Android end-to-end flow,
offline recovery සහ native accessibility පරීක්ෂණ `NOT_RUN` වේ. මේවා local
build එකෙන් පමණක් complete ලෙස සලකන්නේ නැත.

Production migration, deployment, commit හෝ push සිදු කර නැත.
