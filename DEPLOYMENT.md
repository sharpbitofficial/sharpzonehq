# SharpZone Deployment Guide

## সমস্যা সমাধান হয়েছে

আপনার website blank page দেখাচ্ছিল কারণ:
1. `.env` ফাইলে `VITE_SUPABASE_PUBLISHABLE_KEY` missing ছিল
2. Production build configuration optimize ছিল না

## এখন Deploy করুন

### Build করা হয়েছে
`dist/` folder এ production-ready build আছে।

### Deployment Options

#### Option 1: Vercel (Recommended)
1. Vercel তে sign in করুন
2. "Import Project" ক্লিক করুন
3. এই repository select করুন
4. **Environment Variables** section এ যান এবং add করুন:
   - `VITE_SUPABASE_URL` = `https://0ec90b57d6e95fcbda19832f.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw`
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Deploy button ক্লিক করুন

#### Option 2: Netlify
1. Netlify তে sign in করুন
2. "Add new site" → "Import an existing project"
3. Repository select করুন
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment variables:
   - `VITE_SUPABASE_URL` = `https://0ec90b57d6e95fcbda19832f.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw`
6. Deploy site ক্লিক করুন

#### Option 3: Static File Hosting
যদি আপনি সরাসরি `dist/` folder upload করতে চান:
- AWS S3, Firebase Hosting, Cloudflare Pages ইত্যাদিতে upload করুন
- Index document: `index.html`
- Error document: `index.html` (SPA routing এর জন্য)

### Local Testing
```bash
npm run build
npm run preview
```
এটি http://localhost:4173 এ serve করবে।

### Important Notes
- Environment variables অবশ্যই `VITE_` prefix দিয়ে শুরু হতে হবে
- সব deployment platform এ environment variables set করা আবশ্যক
- Browser cache clear করুন deploy এর পরে

## Files Created/Modified
- `.env` - Added `VITE_SUPABASE_PUBLISHABLE_KEY`
- `.env.production` - Production environment variables
- `vite.config.ts` - Optimized build configuration
- `vercel.json` - Vercel deployment config
- `netlify.toml` - Netlify deployment config
- `dist/` - Production build output

## Support
যদি আরও সমস্যা হয়, check করুন:
1. Browser console এ কোনো error আছে কিনা
2. Network tab এ failed requests
3. Environment variables সঠিকভাবে set করা আছে কিনা
