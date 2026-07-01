# Shadow Monarch Spinner System: Native Android Deployment Guide

This documentation guides you through setting up and compiling the Shadow Monarch Spinner System Android Mobile application and configuring your permanent Supabase production backend.

---

## 1. Supabase Cloud Configuration (DDL, RLS & Authentication)

To ensure player metrics, levels, and training progressions are synchronized across unlimited devices securely, configure your Supabase console using the settings below.

### Multi-Device Database Table Setup

1. In your **Supabase Workspace**, navigate to the **Query Editor**.
2. Execute the following SQL declaration to create your resilient progress table:

```sql
-- 1. Create the Player Profiles Table
CREATE TABLE IF NOT EXISTS public.player_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row-Level Security (RLS) for complete data isolation (players can only read/edit their own profiles)
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS READ policy for single players
CREATE POLICY "Players can view their own profiles." 
ON public.player_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 4. Create RLS WRITE/UPDATE policy for single players
CREATE POLICY "Players can update their own profiles." 
ON public.player_profiles 
FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);
```

### Google Sign-In & Redirect URIs

To make sure that Google Sign-In returns directly to the Android app instead of a web browser tab:

1. Navigate to **Authentication** -> **Providers** -> **Google** in the Supabase Dashboard.
2. Enable Google Provider and paste your **Client ID** and **Client Secret** (from the Google Cloud Console).
3. In **Authentication** -> **Redirect URLs**, add the following Redirect URIs:
   * `monarchspinner://callback` (For Android Mobile Device return)
   * `https://YOUR_WEB_DOMAINS` (For Web Deployment testing if applicable)
4. Ensure `monarchspinner://callback` is registered exactly.

### Avatar Storage Bucket

Player avatars are uploaded to Supabase Storage and the public image URL is saved in `profile_data.player.profilePhoto`.

1. Navigate to **Storage** in the Supabase Dashboard.
2. Create a public bucket named `profile-images`.
3. Allow image uploads for `image/png`, `image/jpeg`, `image/jpg`, and `image/webp`.
4. Keep the bucket name consistent across Web, Android, and Render by setting:

```env
VITE_SUPABASE_AVATAR_BUCKET=profile-images
```

If your Supabase project already uses a different public avatar bucket, set `VITE_SUPABASE_AVATAR_BUCKET` to that exact bucket name in every deployment environment.

---

## 2. Advanced Conflict Resolution Engine

The app is built with a sophisticated, offline-first progress merging capability. If your players train offline (building higher levels, quests, or XP) on their Android App and reconnect, the synchronization engine will analyze and resolve conflicts as follows:

* **Level Superiority**: The engine compares local level against the cloud level first. The highest level is preserved.
* **Experience Weighting**: If levels are identical, the device with more XP is determined to have the advanced progress.
* **Quest Multipliers**: If levels and XP match, the profile with more completed Quests is chosen.
* **Timestamp Fallback**: If all metrics match, the latest modification timestamp becomes the source of truth.

This ensures zero progression loss, preventing older cloud backups from wiping out new offline-focused breakthroughs.

---

## 3. Local Web & Native Build Environment Variables

Create simple environment files to securely bind your app to the production database:

### `.env` File Setup
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
VITE_SUPABASE_AVATAR_BUCKET=profile-images
GEMINI_API_KEY=your-gemini-pro-api-key
```

Make sure that **local dev IP addresses or localhost references are never used**. The system is built to target your live production cloud endpoint for total reliability.

---

## 4. Compile to Android APK / App Bundle

Follow these steps to produce a release-ready APK:

### Prerequisites:
* **NodeJS v18+** installed.
* **Android Studio (Ladybug or newer)** installed with Android SDK.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Compile the Client Artifacts
```bash
npx cap sync
```
This builds your React production bundle and synchronizes code inside the native Android folder automatically.

### Step 3: Open in Android Studio
Launch Android Studio and open the `/android` directory inside the project workspace directory. Android Studio will automatically resolve Gradle and configure build properties.

### Step 4: Build APK
* In Android Studio, click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
* Find the output APK folder, and install `app-debug.apk` directly onto any phone, emulator, or distribute it as needed!

---

## 5. App Permissions & Customization

The Android bundle is fully registered with:
* `android.permission.INTERNET` (Enabled in the Android Manifest)
* Custom App launcher icons can be uploaded directly to `android/app/src/main/res/mipmap/` folders.
* Custom package namespace: `com.shadowmonarch.spinner`.
