# Social login setup (Google / Apple / Facebook)

The mobile code and the API endpoints are already wired. To go live you must
create OAuth credentials in each provider console, then:

1. copy the JS values into `.env` (start from [`.env.example`](../.env.example)), and
2. replace the `REPLACE_WITH_*` placeholders in [`app.json`](../app.json), and
3. set the API env vars on your deployment.

Because native modules were added, you also need a **fresh dev-client / EAS
build** — a JS-only OTA update is not enough.

App identifiers used below: **bundle id / package = `com.laundry.customer`**.

## What the app sends to the API

| Provider | Device library                              | API endpoint                | Payload |
| -------- | ------------------------------------------- | --------------------------- | ------- |
| Google   | `@react-native-google-signin/google-signin`| `POST /auth/google/login`   | `{ idToken }` |
| Apple    | `expo-apple-authentication` (iOS only)      | `POST /auth/apple/login`    | `{ idToken, firstName?, lastName? }` |
| Facebook | `react-native-fbsdk-next`                   | `POST /auth/facebook/login` | `{ accessToken }` |

---

## 1. Google

Console: <https://console.cloud.google.com> → **APIs & Services → Credentials**

1. Pick/create a project, then **Configure OAuth consent screen** (External; add
   app name + support email). While it stays in "Testing", only whitelisted
   Google accounts can sign in — fine for development.
2. **Create Credentials → OAuth client ID**, three times:

   | Client type | Enter | Produces |
   | ----------- | ----- | -------- |
   | **Web application** | any name | **Client ID** + **Client secret** |
   | **iOS** | bundle ID `com.laundry.customer` | iOS **Client ID** |
   | **Android** | package `com.laundry.customer` + **SHA-1** | (nothing to copy — just registers the app) |

3. **Android SHA-1**: for EAS builds, run `eas credentials` (Android →
   production) and copy the SHA-1 of the EAS keystore.

> **The Web client id is the linchpin.** The API verifies the `idToken`'s
> audience against `GOOGLE_CLIENT_ID`, and the app requests the token with that
> same id as `webClientId`. They **must be identical**.

---

## 2. Apple  *(requires the paid Apple Developer Program — $99/yr)*

Console: <https://developer.apple.com/account> → **Certificates, IDs & Profiles → Identifiers**

1. Open the App ID for `com.laundry.customer` → enable **Sign In with Apple** → Save.
2. That is all for a **native iOS** app — no Service ID or key needed (those are
   only for web/Android Apple sign-in, which we don't use; the button is
   iOS-only).
3. `app.json` already sets `ios.usesAppleSignIn: true` and includes the
   `expo-apple-authentication` plugin (adds the entitlement at build time).

---

## 3. Facebook

Console: <https://developers.facebook.com/apps> → **Create App** (type **Consumer**, use case "Facebook Login")

1. **Settings → Basic** → copy **App ID** and **App Secret**.
2. **Settings → Advanced → Security** → copy the **Client Token**.
3. Add platforms: **iOS** (bundle id `com.laundry.customer`) and **Android**
   (package + key hashes from your keystore).
4. Add the **Facebook Login** product. To request `email` from real users in
   production you must pass **App Review / Business Verification**. In
   *Development mode* only admins/testers/developers you add can log in — enough
   to test.

---

## Where every value goes

### `app.json` — replace the `REPLACE_WITH_*` placeholders

| Placeholder | Value |
| ----------- | ----- |
| google plugin `iosUrlScheme` → `com.googleusercontent.apps.REPLACE_WITH_GOOGLE_IOS_CLIENT_ID` | the **reversed** iOS client id (Google shows it; it's `com.googleusercontent.apps.<digits>-<hash>`) |
| fbsdk `appID` = `REPLACE_WITH_FACEBOOK_APP_ID` | Facebook **App ID** |
| fbsdk `clientToken` = `REPLACE_WITH_FACEBOOK_CLIENT_TOKEN` | Facebook **Client Token** |
| fbsdk `scheme` = `fbREPLACE_WITH_FACEBOOK_APP_ID` | `fb` + App ID (e.g. `fb1234567890`) |

### Mobile `.env` (or EAS secrets via `eas secret:create`)

| Var | Value |
| --- | ----- |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google **Web** client id (= API `GOOGLE_CLIENT_ID`) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google **iOS** client id |

### API env (set on the deployment)

| Var | Value |
| --- | ----- |
| `GOOGLE_CLIENT_ID` | Google **Web** client id (same as the app's web id) |
| `GOOGLE_CLIENT_SECRET` | Google Web client **secret** |
| `APPLE_APP_AUDIENCE` | JSON array incl. the bundle id: `["com.laundry.customer"]` |
| `FACEBOOK_APP_ID` | Facebook **App ID** |
| `FACEBOOK_APP_SECRET` | Facebook **App Secret** |

---

## Build after filling everything in

```bash
# from apps/customer
npx expo prebuild --clean        # regenerate native projects with the new config
eas build --profile development  # or: npx expo run:ios / run:android
```

Replace every `REPLACE_WITH_*` in `app.json` **first** — the Facebook plugin
fails prebuild on a placeholder App ID.

## Fastest path to test one provider

**Google** is quickest: create the **Web** client id (set it as both
`GOOGLE_CLIENT_ID` on the API and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env`),
add the **iOS** client + its reversed `iosUrlScheme`, rebuild the dev client.
Apple needs the paid account; Facebook needs the app + (for production) review.
