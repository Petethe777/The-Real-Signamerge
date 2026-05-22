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

To make sure the website connects and functions correctly on external hosting, open the **SQL Editor** in your Supabase project dashboard and run the following queries to create the necessary tables and structure:

### 1. `profiles` Table
This table holds user business credentials and answers gathered during the Customer Audit Process.

```sql
-- Create the profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  company_name text,
  location text,
  socials jsonb default '{}'::jsonb,
  customer_phrases jsonb default '[]'::jsonb,
  customer_keywords jsonb default '[]'::jsonb,
  usp text,
  selling_region jsonb default '{}'::jsonb,
  audit_completed boolean default false,
  is_approved boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies to allow read/write operations (disable/adjust as needed according to security standards)
create policy "Allow public profiles read access" 
  on public.profiles for select 
  using (true);

create policy "Allow users to upsert their own profile" 
  on public.profiles for all 
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

### 2. `search_queries` Table
This table is populated with every query entered into the top navigation search engine and the dashboard’s keyword search.

```sql
-- Create the search queries tracker table
create table public.search_queries (
  id bigint generated always as identity primary key,
  query text not null,
  user_email text default 'anonymous'::text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.search_queries enable row level security;

-- Policies
create policy "Allow inserts to search_queries" 
  on public.search_queries for insert 
  with check (true);

create policy "Allow select access for admins or authenticated users" 
  on public.search_queries for select 
  using (true);
```

---

All files (including the main dashboard router) now load credentials exclusively from this new folder dynamically, making cross-platform transfers smooth and frictionless.
