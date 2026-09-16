# ZODIAC — Product Requirements & Build Log

## Original Problem Statement
Build "Zodiac" — a polished iOS/Android mobile app (Expo React Native + FastAPI + MongoDB) that gives users
personalized daily astrology predictions based on birth info + current planetary positions, styled with a
cosmic/celestial premium visual theme (see attached reference images: Home_screen_ui, SplashScreenImg,
HowItWorks, logo). Journey: Splash → Mobile+OTP Auth → Signup (birth details) → Zodiac calc → How-it-works intro
→ Home (Daily Predictions + Remedies + Subscription). Returning users skip straight to Home after login. Uses
Twilio Verify for OTP. Home screen: header (profile/ZODIAC wordmark/notifications bell), hero (greeting + zodiac
sign + cosmic illustration), "My Daily Zodiac Predictions" (Love/Career/Finance/Wellbeing), "Daily Remedies /
Task-Challenge", Daily Streak badge, bottom bar (Ask Astrologer / center Premium CTA / Shop). Subscription: 2-day
free trial → ₹99/month via RevenueCat (afterwards locked with blur + "Start Your Subscription" CTA). Notifications
via bell icon. My Account: profile info + edit + subscription mgmt + notif prefs + logout. Predictions must be
genuinely personalized (not generic per-sign horoscope), positive/practical/non-deterministic tone, AI-generated.
User explicitly asked to NOT build any unit-testing framework to conserve credits — functional/manual testing only.

## User-Confirmed Choices (from initial ask_human)
- AI model: **Gemini 2.5 Flash** via Emergent Universal LLM Key for daily content generation.
- Astrology calc: **Simplified** — Western sun-sign computed server-side from DOB + deterministic simulated
  planetary transits (seeded by user_id + date + dob) fed into the AI prompt for personalization. No external
  paid astrology API (VedAstro etc. deferred).
- Auth: **Real Twilio Verify** (Account SID + Auth Token provided by user) with a whitelisted test-bypass mobile
  number (`+919999999999` / code `123456`) so QA doesn't incur real SMS costs.
- Subscription: **SIMULATED / MOCKED** — full trial→lock→paywall UX built, backend tracks subscription_status in
  Mongo; `/api/subscription/subscribe` instantly activates premium with no real payment. Real RevenueCat
  integration deferred to a later phase (requires native build + store products).
- Notifications: **In-app notification panel (bell icon) + local on-device scheduled reminders** via
  expo-notifications. No real remote push (requires native build, out of scope for Expo Go preview).

## Architecture
- **Backend** (`/app/backend`): FastAPI + Motor (MongoDB async). Modular: `models.py` (Pydantic + PyObjectId +
  BaseDocument per Mongo adherence rules), `auth.py` (JWT), `database.py`, `routes/` (auth, users, predictions,
  notifications, subscription), `services/` (zodiac_service — sun-sign calc + transit simulation, ai_service —
  Gemini 2.5 Flash prompt/JSON parsing with fallback, twilio_service — Verify send/check with test bypass,
  subscription_service — trial/lock logic).
- **Frontend** (`/app/frontend`): Expo Router (file-based). `app/` screens: `index.tsx` (splash), `(auth)/login,
  otp, signup`, `onboarding.tsx`, `home.tsx`, `account.tsx`, `edit-profile.tsx`, `notifications.tsx`,
  `subscription.tsx`, `ask-astrologer.tsx`, `shop.tsx`, `prediction-detail.tsx`. Shared: `src/theme.ts` (cosmic
  dark palette per design_guidelines.json), `src/context/` (AuthContext, ToastContext — no Alert() used anywhere),
  `src/api/client.ts`, `src/components/` (AppHeader, BottomActionBar, GlassCard, PrimaryButton,
  ZodiacHeroIllustration, PredictionRow, StreakBadge, LockOverlay, ConfirmSheet, DateTimeField, StarsBackground).

## What's Been Implemented (as of 2026-02, initial build)
- Splash screen with 3s zoom animation using downloaded brand assets (logo, splash bg).
- Mobile + Twilio Verify OTP login/signup flow with JWT session (30-day token in SecureStore).
- Birth-details signup form (name, DOB, place required; time of birth & email optional); DOB/time pickers use
  native iOS spinner sheet / Android dialog, with a plain-text web fallback (datetimepicker has no web support).
- Server-side zodiac sign calculation (12-sign boundary logic, unit-verified by testing agent).
- How-it-works onboarding screen (static image, 3s auto-dismiss or tap).
- Home screen: sticky header w/ unread badge, cosmic hero illustration (procedural zodiac-wheel component),
  personalized greeting, "My Daily Zodiac Predictions" card (Love/Career/Finance/Wellbeing rows, AI-generated,
  cached per user/day in Mongo), Daily Task/Challenge remedy card w/ check-in → streak increment, Daily Streak
  badge, trial countdown pill, blur/lock overlay + "Start Your Subscription" CTA once trial/subscription expired,
  bottom bar (Ask Astrologer / gold Premium CTA / Shop).
- Prediction detail, My Account (full profile + notif toggles + cancel sub + logout, all via ConfirmSheet not
  Alert), Edit Profile, Notifications panel (mark-all-read), Subscription paywall (₹99/month, simulated
  subscribe), Ask Astrologer "coming soon", Shop "coming soon" with product grid.
- Full test pass by testing_agent_v3_expo: 25/26 backend checks passed, 100% of tested frontend flows passed, no
  bugs found. (No automated test suite was retained in the repo per user's explicit request to conserve credits —
  the agent's scratch test file was deleted after verification.)

## Prioritized Backlog / Next Steps
- **P0 (when ready to monetize for real):** Replace simulated subscription with real RevenueCat integration
  (requires native build — not testable in Expo Go).
- **P1:** Real remote push notifications via Emergent-managed push (also requires native build).
- **P1:** True new-signup UI regression coverage (current test bypass mobile always maps to an existing seeded
  user, so only the zodiac-calc logic was unit-verified for brand-new signups, not the full new-user UI path).
- **P2:** Optional richer astrology data source (VedAstro or ephemeris API) for deeper Vedic-style personalization
  beyond the current simulated transits.
- **P2:** Ask Astrologer real chat feature; Shop real e-commerce/checkout.
