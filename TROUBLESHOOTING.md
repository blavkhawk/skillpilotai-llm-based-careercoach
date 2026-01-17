# Resume Analysis Troubleshooting Guide

## Issue: Resume analysis not working

### Root Causes & Fixes:

#### 1. **Missing Google AI API Key** ⚠️
**Problem**: The `.env.local` file has placeholder API keys

**Solution**:
1. Get your Google AI API key from: https://makersuite.google.com/app/apikey
2. Open `.env.local`
3. Replace `your_google_ai_api_key_here` with your actual API key:
   ```
   GOOGLE_GENAI_API_KEY=AIzaSy...your_actual_key_here
   ```
4. Restart the dev server: `npm run dev`

#### 2. **File Format Support**
**Currently Supported**: DOCX, TXT  
**Not Supported**: PDF (requires additional server-side setup)

**Workaround for PDF**:
- Convert PDF to TXT using online tools
- Copy-paste text into a .txt file

#### 3. **Testing the Analysis**

**Create a test resume file** (`test-resume.txt`):
```
John Doe
Senior Full Stack Developer

EXPERIENCE:
- 5 years of React and TypeScript development
- Built scalable Node.js microservices
- Led team of 3 developers
- Experience with AWS, Docker, Kubernetes

SKILLS:
Frontend: React, TypeScript, Next.js, Tailwind CSS
Backend: Node.js, Express, PostgreSQL, MongoDB
DevOps: AWS, Docker, Kubernetes, CI/CD
```

**Steps to test**:
1. Go to http://localhost:3000/assessments
2. Upload `test-resume.txt`
3. Fill in:
   - Name: John Doe
   - Field: Full Stack Development
   - Skills: React, Node.js, AWS
4. Click "Analyze Resume"
5. Check browser console (F12) for detailed logs

#### 4. **Debug Console Logs**

Open browser DevTools (F12 → Console) and look for:
- `📤 Uploading file:` - File upload started
- `✅ Resume parsed, text length:` - File successfully parsed
- `🤖 Starting AI analysis...` - AI analysis started  
- `✅ Analysis complete:` - Success with results
- `❌ Error:` - Error details

#### 5. **Common Errors**

**Error: "API key not valid"**
→ Check `.env.local` has correct Google AI API key

**Error: "Failed to parse resume"**
→ File might be corrupted or wrong format (use DOCX or TXT only)

**Error: "Resume file appears to be empty"**
→ File has less than 50 characters, add more content

**Error: "fetch failed" or network error**
→ Dev server might be down, restart with `npm run dev`

---

## Quick Fix Steps:

1. ✅ Add your Google AI API key to `.env.local`
2. ✅ Restart dev server: `npm run dev`
3. ✅ Use DOCX or TXT file (not PDF)
4. ✅ Ensure resume file has at least 50 characters
5. ✅ Check browser console for detailed error logs
6. ✅ Test with the sample resume above

---

## Need Help?
- Check the browser console (F12) for errors
- Check terminal for server errors
- Verify API key is valid at https://makersuite.google.com/

---

# YouTube Videos Troubleshooting Guide

## Issue: Career Roadmap showing example YouTube videos instead of real ones

### Root Cause
The YouTube API is falling back to mock/example data because the API call is failing or returning empty results.

### Diagnosis Steps

1. Go to Career Path page (`/career-path`)
2. Generate a roadmap
3. Click "Load Videos" on any stage
4. Check your terminal for logs:
   - `🎥 Fetching YouTube videos via RapidAPI...` or `...via Google API...`
   - `📡 API Response Status: XXX`
   - `📦 API response structure...`
   - Look for errors or "⚠️ Falling back to mock data"

### Solutions

#### Option 1: Use Google YouTube Data API v3 (Recommended ✅)

**Why Google API?**
- ✅ More reliable
- ✅ Free tier: 10,000 units/day (~100 search requests)
- ✅ Official Google API
- ✅ Better video metadata
- ✅ Easy to set up

**Setup Steps:**

1. **Get API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
   - Go to "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key (starts with `AIzaSy...`)

2. **Update Environment Variable**:
   Open `.env.local` and replace the YouTube key:
   ```bash
   # Replace the RapidAPI key with Google API key
   YOUTUBE_API_KEY=AIzaSy...  # Your Google YouTube API key
   ```

3. **Restart Server**:
   ```bash
   npm run dev
   ```

4. **Test**:
   - Go to Career Path
   - Generate a roadmap
   - Click "Load Videos"
   - You should see real YouTube videos!

#### Option 2: Use RapidAPI YouTube Search (Current Setup)

Your current API key (`4720b91364msha...`) is a RapidAPI key.

**To fix RapidAPI issues:**

1. **Subscribe to the API**:
   - Go to [RapidAPI YouTube Search](https://rapidapi.com/h0p3rwe/api/youtube-search-and-download)
   - Subscribe to the API (free tier available)
   - Test in RapidAPI playground to ensure it works

2. **Check Rate Limits**:
   - Free tier might be exhausted
   - Check your RapidAPI dashboard for usage

3. **Verify API Key**:
   - Make sure your key has access to "YouTube Search and Download" API

#### Option 3: Keep Using Example Data (Temporary)

The example data is functional and good for testing. The feature works perfectly, just with placeholder videos. You can use this while getting a proper API key.

### How the App Detects Which API to Use

The app automatically detects based on your key format:

```typescript
// Key contains 'msh' or 'jsn' → RapidAPI
// Otherwise → Google YouTube Data API v3
```

### Testing the API Manually

**Test Your Current Setup in Browser Console:**

```javascript
fetch('/api/fetch-youtube-videos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'React tutorial', maxResults: 3 })
})
.then(r => r.json())
.then(d => console.log('Videos:', d))
```

**Check if videos are real:**
- ❌ Example IDs: `dQw4w9WgXcQ`, `yXQViqx6GMY`, `jNQXAC9IVRw`
- ✅ Real videos: Random IDs with real titles/channels

**Test RapidAPI directly:**
```bash
curl -X GET \
  "https://youtube-search-and-download.p.rapidapi.com/search?query=React%20tutorial&type=v" \
  -H "X-RapidAPI-Key: YOUR_KEY" \
  -H "X-RapidAPI-Host: youtube-search-and-download.p.rapidapi.com"
```

**Test Google API directly:**
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=React+tutorial&type=video&maxResults=3&key=YOUR_KEY"
```

### Expected Behavior After Fix

Once properly configured, when you click "Load Videos":
- ✅ Real YouTube video thumbnails
- ✅ Actual video titles related to the learning topic
- ✅ Real channel names
- ✅ Working links that open YouTube
- ✅ Recent videos (not always the same 3)

### Files Involved

- `src/app/api/fetch-youtube-videos/route.ts` - API route handler
- `src/app/(app)/career-path/page.tsx` - Frontend display
- `.env.local` - API key configuration

### Status

🟡 **Current**: Falling back to example data (API not configured/failing)  
✅ **Feature**: Fully functional, just needs real API data  
🎯 **Goal**: Get real YouTube videos by configuring API key

### Quick Recap

1. **Best Solution**: Use Google YouTube Data API v3
2. **Get API Key**: Google Cloud Console → YouTube Data API v3 → Create API Key
3. **Update `.env.local`**: `YOUTUBE_API_KEY=AIzaSy...`
4. **Restart**: `npm run dev`
5. **Test**: Generate roadmap → Load Videos → See real videos! 🎉
