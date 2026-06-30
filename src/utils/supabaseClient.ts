import { createClient } from "@supabase/supabase-js";

let supabaseClient: any = null;
let warnLogged = false;

/**
 * Returns the Supabase client if URL and Anon Key are correctly configured,
 * or null if they are missing or still placeholder values.
 */
export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const anonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (
    !url ||
    !anonKey ||
    url === "https://your-supabase-project.supabase.co" ||
    anonKey === "your-supabase-public-anon-key" ||
    url.trim() === "" ||
    anonKey.trim() === ""
  ) {
    if (!warnLogged) {
      console.warn(
        "Supabase Client: Credentials not detected. Running in Offline Local Profile Mode."
      );
      warnLogged = true;
    }
    return null;
  }

  try {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseClient;
  } catch (e) {
    console.error("Supabase Client Init Error:", e);
    return null;
  }
}
