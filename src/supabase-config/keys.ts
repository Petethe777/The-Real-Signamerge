/**
 * Supabase API Keys and Connection Configuration
 * 
 * This folder is dedicated to managing Supabase keys for easy migration and deployment 
 * on external hosting platforms like Vercel, Netlify, Render, or Cloudflare Pages.
 * 
 * Usage options for deployment:
 * 1. [RECOMMENDED] Set environment variables 'VITE_SUPABASE_URL' and 'VITE_SUPABASE_ANON_KEY' 
 *    in your hosting provider's dashboard.
 * 2. Direct Fallback: Insert your production credentials directly into the fallback string 
 *    placeholders below if your hosting provider doesn't support environment injects.
 */

export const SUPABASE_CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "https://sscuyhvkyfemrsmfxhkt.supabase.co",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzY3V5aHZreWZlbXJzbWZ4aGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MzQ5MzAsImV4cCI6MjA5NDMxMDkzMH0.qoURHMmKre8uGLem4b6GBrqtt4yHaUlE9LI9PYxW-c4"
};
