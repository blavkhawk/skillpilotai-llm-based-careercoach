# Firebase Authentication Setup Guide

## ✅ Completed Steps

1. ✅ Firebase SDK installed (v11.x)
2. ✅ Firebase configuration file created (`src/lib/firebase.ts`)
3. ✅ Authentication context created (`src/contexts/AuthContext.tsx`)
4. ✅ AuthProvider added to app layout
5. ✅ Login/Signup page created (`/auth`)
6. ✅ User menu component with logout functionality
7. ✅ Protected routes implemented
8. ✅ Landing page redirects authenticated users

## 🔧 Firebase Project Setup (Required)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "skillpilotai")
4. Enable/disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication Methods

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
5. Enable **Google Sign-In**:
   - Click on "Google"
   - Toggle "Enable"
   - Select support email
   - Click "Save"

### Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`) to add a web app
4. Register app with a nickname (e.g., "SkillPilotAI Web")
5. **Copy the configuration values** from the Firebase SDK snippet:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

### Step 4: Add Configuration to .env.local

Update your `.env.local` file with the Firebase values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

⚠️ **Important**: Never commit `.env.local` to version control!

### Step 5: Configure Authorized Domains (for Production)

1. In Firebase Console, go to **Authentication > Settings > Authorized domains**
2. Add your production domain (e.g., `your-app.vercel.app`)
3. `localhost` is already authorized for development

## 🧪 Testing the Authentication

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3002`

3. Click "Get Started" to go to `/auth`

4. Test signup:
   - Switch to "Sign Up" tab
   - Enter name, email, password
   - Click "Create Account"
   - You should be redirected to `/dashboard`

5. Test logout:
   - Click user avatar in top-right corner
   - Click "Log out"
   - You should be redirected to `/auth`

6. Test login:
   - Enter your email and password
   - Click "Login"
   - You should be redirected to `/dashboard`

7. Test Google Sign-In:
   - Click "Continue with Google"
   - Select Google account
   - Authorize the app
   - You should be redirected to `/dashboard`

## 🔒 Features Implemented

### Authentication Methods
- ✅ Email/Password signup with display name
- ✅ Email/Password login
- ✅ Google OAuth sign-in
- ✅ Logout functionality

### User Experience
- ✅ Loading states during auth operations
- ✅ Toast notifications for success/error messages
- ✅ Form validation (password length, matching passwords)
- ✅ User avatar with initials
- ✅ User dropdown menu with profile and logout

### Route Protection
- ✅ Protected routes (dashboard, assessments, etc.)
- ✅ Automatic redirect to `/auth` for unauthenticated users
- ✅ Automatic redirect to `/dashboard` for authenticated users on landing page
- ✅ Auth state persistence across page refreshes

### UI/UX
- ✅ Cyberpunk-themed login/signup page
- ✅ Tabbed interface (Login/Signup)
- ✅ Input icons for better UX
- ✅ Loading indicators
- ✅ Error handling with user-friendly messages

## 📝 User Flow

1. **New User**:
   - Lands on homepage (`/`)
   - Clicks "Get Started"
   - Redirected to `/auth`
   - Signs up with email or Google
   - Redirected to `/dashboard`
   - Can now access all features

2. **Returning User**:
   - Lands on homepage (`/`)
   - If already logged in → auto-redirected to `/dashboard`
   - If not logged in → clicks "Get Started" → `/auth`
   - Logs in with email or Google
   - Redirected to `/dashboard`

3. **Authenticated User**:
   - Can access all app routes
   - User avatar shows in header
   - Can click avatar to access profile or logout
   - Auth state persists across page refreshes

## 🚀 Next Steps (Optional Enhancements)

1. **Email Verification**
   - Send verification email after signup
   - Require verification before full access

2. **Password Reset**
   - Add "Forgot Password?" link
   - Send password reset email

3. **User Profile**
   - Create dedicated profile page
   - Allow users to update display name and email
   - Upload profile picture

4. **Firestore Integration**
   - Store user preferences
   - Save quiz results
   - Track learning progress
   - Resume analysis history

5. **Social Features**
   - LinkedIn OAuth
   - GitHub OAuth (for developers)

6. **Security Enhancements**
   - Rate limiting on auth endpoints
   - CAPTCHA for signup
   - Two-factor authentication

## ❓ Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Make sure all Firebase environment variables are set in `.env.local`
- Restart the development server after updating `.env.local`

### Error: "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Authorized domains in Firebase Console
- For localhost, it should already be authorized

### Google Sign-In popup closes without logging in
- Check Firebase Console → Authentication → Sign-in method → Google → Make sure it's enabled
- Ensure support email is selected
- Check browser console for detailed errors

### Users not staying logged in after refresh
- This should work automatically with `onAuthStateChanged`
- Check browser console for errors
- Make sure Firebase config is correct

## 📚 Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com)
- [Next.js + Firebase Guide](https://firebase.google.com/docs/web/setup)
