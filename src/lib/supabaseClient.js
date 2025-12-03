// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

/**
 * IMPORTANT:
 * Create React App requires env variables to start with REACT_APP_*
 * and they must be defined in a .env file at project root.
 *
 * Example .env:
 * REACT_APP_SUPABASE_URL=https://kolhitsogdikocxknpzd.supabase.co
 * REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
 */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";

const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

// Safety warning in console (does NOT break app startup)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Supabase] Missing env vars: REACT_APP_SUPABASE_URL and/or REACT_APP_SUPABASE_ANON_KEY.\n' +
      'Create a `.env` at project root (not committed) with these variables.\n' +
      'See `./.env.example` for the expected format.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
