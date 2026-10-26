<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1c2f67d0-b572-49b2-b5c1-2b106d8751f7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## KITNOVA Logo and App Icons
- `public/kitnova-logo.png`: full logo for app screens and branding.
- `public/icon-192.png` and `public/icon-512.png`: PWA install icons.
- `public/apple-touch-icon.png`: iOS home-screen icon.
- `public/favicon-96.png`: browser tab icon.
- `android-icon-assets/`: Android launcher PNGs in mdpi through xxxhdpi sizes.

The project currently contains a Vite web app and does not include a native `android/` platform folder. These assets configure the website/PWA icon and provide launcher PNGs, but they do not by themselves produce an APK or install the icon into an APK. If you later add Capacitor Android, copy the launcher assets into the Android resource folders or generate adaptive icons with your Android icon tool, then rebuild the APK.


## Security, offline cache and startup improvements

- Authentication now requires a real Supabase Auth session. Local demo users and client-side role switching do not grant access.
- Supabase sessions are restored at startup and remain persisted through Supabase Auth until logout. Logout clears local UI state and requests server session sign-out.
- Card checkout is blocked until a verified card payment provider is connected; the client no longer marks card orders paid just because checkout was submitted.
- The branded startup screen displays a progress bar for at least 20 seconds while attempting to restore the Supabase session.
- The service worker caches the app shell, built assets, same-origin images, and successfully fetched external images for offline reuse. Home/product/order data in the local store continues to persist in localStorage for offline viewing; offline-created orders still require a deliberate server sync before they can be treated as accepted production orders.
- Product imagery has been moved to `/public/assets/images` so paths continue to work after Vite production builds. `CachedImage` adds a shimmer skeleton while images load and a branded fallback when an image is unavailable.

## Important release validation

Run `npm install`, `npm run build`, and `npm run lint` in an environment with package registry access. Then test login/logout persistence, offline/online transitions, checkout failure handling, Relworx webhook confirmation, RLS policies, and native Android installation. The archive has not been build-verified in this environment because package installation timed out.

## Shared Admin Font & Artwork Library (Supabase)

The studio font and artwork library can now publish assets to Supabase Storage so approved assets are shared across customer devices. Before deploying the app, open the Supabase SQL Editor for project `qodecquwaxrwtwepkdxg` and run `supabase/migrations/20261026_shared_studio_assets.sql`. This migration creates the public-read `kitnova-studio-assets` bucket and `studio_assets` table. Upload, update, and delete are restricted by RLS to users accepted by the existing `public.is_admin()` function (active admin roles in `profiles`).

Use an authenticated, active admin account when uploading or managing shared assets. Customers only receive enabled assets. The browser still retains local cached copies for offline use; a new device needs an internet connection once to download each asset. The migration is not applied automatically by this ZIP, and it has not been applied to your live Supabase project by packaging this source.
