# 🔥 Firebase Authentication - Quick Start

## What's Been Set Up

All the code infrastructure for Firebase Authentication is complete! Here's what you have:

- ✅ Firebase SDK installed
- ✅ Auth configuration (`src/lib/firebase.ts`)
- ✅ Auth context provider (`src/contexts/AuthContext.tsx`)
- ✅ Login/Signup page at `/auth`
- ✅ User menu with logout in header
- ✅ Protected routes for all app pages
- ✅ Auto-redirect for authenticated/unauthenticated users

## What You Need to Do

### 1️⃣ Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it "skillpilotai" (or your choice)
4. Click through the setup wizard

### 2️⃣ Enable Authentication (2 minutes)

1. In your Firebase project, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **Email/Password**:
   - Click "Email/Password" → Toggle ON → Save
5. Enable **Google**:
   - Click "Google" → Toggle ON → Select support email → Save

### 3️⃣ Get Your Config (1 minute)

1. Click the **gear icon** (Project Settings)
2. Scroll to **"Your apps"**
3. Click the **Web icon** (`</>`)
4. Register app with nickname "SkillPilotAI Web"
5. **Copy the config values** that look like this:

```javascript
apiKey: "AIzaSy..."
authDomain: "your-project.firebaseapp.com"
projectId: "your-project"
storageBucket: "your-project.appspot.com"
messagingSenderId: "1234567890"
appId: "1:1234567890:web:abcdef"
```

### 4️⃣ Add to .env.local (1 minute)

Open `.env.local` and replace the placeholder values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=<your apiKey>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your authDomain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your projectId>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your storageBucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your messagingSenderId>
NEXT_PUBLIC_FIREBASE_APP_ID=<your appId>
```

### 5️⃣ Restart Dev Server

```bash
npm run dev
```

## ✅ Test It!

1. Go to `http://localhost:3002`
2. Click "Get Started"
3. Create an account with email/password
4. You should be logged in and see your avatar in the header!

## 🎯 Features Ready to Use

- **Email/Password Auth**: Full signup and login
- **Google Sign-In**: One-click authentication
- **Protected Routes**: Only authenticated users can access app pages
- **User Profile**: Avatar with initials, display name, email
- **Logout**: Click avatar → Log out
- **Auto-redirect**: Logged in users skip landing page
- **Persistent Sessions**: Stay logged in across page refreshes

## Need Help?

See `FIREBASE_SETUP.md` for detailed documentation and troubleshooting.
