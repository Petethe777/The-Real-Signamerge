# Supabase Deployment & Connection Guide

This folder contains the centralized configuration for your Supabase keys, calibrated for deployment on other hosting platforms (such as Netlify, Vercel, Render, or Cloudflare Pages).

---

## 🚀 How to Connect Your Keys on Another Platform

When deploying your website to are external platform, you have two flexible methods to ensure your customer search engine connects seamlessly:

### Option A: Using Environment Variables (Recommended)
Add the following key-value pairs in your hosting platform's Admin Dashboard under **Environment Variables**:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Project's API URL | `https://xcyzabcde.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Project's anonymous API key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

> 💡 **Why this is best:** Environment variables keep your production database credentials hidden and secure. Vite automatically injects variables prefixed with `VITE_` at build-time.

---

### Option B: Direct Hardcoded Configuration (Backup fallback)
If you cannot configure environment variables on your platform or are building a fast offline standalone build, you can set the credentials directly inside the `/src/supabase-config/keys.ts` file:

```typescript
export const SUPABASE_CONFIG = {
  supabaseUrl: "https://your-real-project-url.supabase.co",      // <--- Change this
  supabaseAnonKey: "your-real-anon-key-here"                     // <--- Change this
};
```

---

## 🛠️ Required Supabase Database Schema

To make sure the website connects and functions correctly, ensure that you have configured the following tables/policies in your new Supabase project:

1. **Email Auths**: Go to Authentication in Supabase, make sure **Email provider** is enabled.
2. **Users / Profiles (if applicable)**: A clean connection schema for handling session logins.

All files (including the main dashboard router) now load credentials exclusively from this new folder dynamically, making cross-platform transfers smooth and frictionless.
