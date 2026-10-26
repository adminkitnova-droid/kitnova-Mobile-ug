# KITNOVA Studio Upload Features

## Customer jersey image upload
- Open Jersey Studio and choose **Upload Logo**.
- Choose a PNG, JPG, WebP, or other browser-supported image up to 8 MB.
- The image is added as a design layer on the selected front/back side and can be selected, positioned, scaled, rotated, hidden, or removed using the existing layer tools.
- Online uploads use the configured Cloudinary unsigned upload preset. If upload is offline or the service is unavailable, the current design can use a local data URL for the draft; that local draft is not a permanent shared asset.

## Admin custom fonts
- Open Admin → Studio Rules & Pricing Center → Font Catalog & Previews.
- Upload `.woff`, `.woff2`, `.ttf`, or `.otf` font files up to 1.5 MB.
- Enter an optional display name. Uploaded font is available to the Studio font picker in that same browser/device and can be enabled/disabled or set as default using the existing controls.
- Font file data is saved in local browser storage for this implementation. For multi-device production use, upload font files to a controlled shared asset store and save the URL/metadata in a server-authorized database table.

## Admin artwork library
- In the same Studio Rules & Pricing Center, upload an image, choose its category, and give it a name.
- Images are uploaded via the configured Cloudinary service and appear in the customer's Studio → Artwork → Admin Artwork Library list when that catalog is available in the same browser/device.
- Disable/enable artwork or delete it from the admin library.
- The artwork metadata currently persists in local browser storage. For all customer devices to receive admin changes, connect this catalog to a Supabase table with RLS and admin-only write permissions before production rollout.

## Production checks
- Confirm Cloudinary's unsigned upload preset is configured to permit only intended formats and sensible size limits.
- Do not store secret API keys in client-side code.
- Test font rendering on Android WebView and target browsers; some font files may have licensing restrictions.
- Run `npm install`, `npm run lint`, and `npm run build` after extracting the ZIP.
