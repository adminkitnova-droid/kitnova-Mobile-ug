# KITNOVA Jersey — Android APK setup

This project is a Vite + React web app prepared to be wrapped with Capacitor. The Android native project is **not included yet**; create it on your computer or Android/Termux environment using the steps below.

## 1. Requirements
- Node.js and npm compatible with the versions required by Vite 8.
- Java JDK 21.
- Android SDK and Android build tools. On Android/Termux, building a native APK locally can be difficult because the Android SDK/Gradle toolchain is not fully supported in every Termux setup; a cloud Android build runner is an alternative.

## 2. Install dependencies
From the project root:

```sh
npm install
```

If npm reports dependency or engine-version errors, check `node -v` and `npm -v`; do not delete the lockfile until the cause is understood.

## 3. Build the web assets

```sh
npm run build
```

The Vite build should produce the `dist/` directory. Fix any TypeScript or Vite build errors before continuing.

## 4. Generate the Android project

```sh
npx cap add android
```

Run this only once. If an `android/` directory already exists, do not repeat the command; use sync instead.

## 5. Sync the app and web assets

```sh
npm run android:sync
```

## 6. Add the launcher icon

The project includes generated icon source assets in `android-icon-assets/` and `resources/icon.png`. After `android/` is created, copy each `mipmap-*/ic_launcher.png` from `android-icon-assets/` into the matching folder under:

`android/app/src/main/res/`

If your generated Android project has `ic_launcher_round.png` or adaptive-icon XML resources, make sure they reference the KITNOVA artwork too. Keep a backup of the generated `res/` directory before replacing files.

## 7. Build a debug APK

With Android SDK and Gradle configured:

```sh
cd android
./gradlew assembleDebug
```

The APK should be generated at:

`android/app/build/outputs/apk/debug/app-debug.apk`

## 8. Test before sharing
- Install on a real Android phone and verify login, shop, studio, cart, checkout, order tracking, and admin access.
- Verify Supabase URL/keys are only the intended public client values; never put a Supabase service-role key or Relworx secret in the frontend.
- Test Relworx checkout only with a controlled transaction. A payment is not confirmed until the server verifies the provider webhook.
- Confirm external links, file uploads, camera/location needs (if any), keyboard behavior, and back navigation.

## Important
This archive contains the Capacitor configuration and build instructions, **not a built APK**. A successful `npm run build`, Android SDK/Gradle setup, and `assembleDebug` are still required to produce the APK.
