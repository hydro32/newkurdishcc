import { createClient } from "@supabase/supabase-js";

// Use runtime fallbacks that won't crash during static build prerendering
const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
};

const getSupabaseKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
};

// Export a proxy or client that safely initializes on the client side
export const supabase = createClient(getSupabaseUrl(), getSupabaseKey());