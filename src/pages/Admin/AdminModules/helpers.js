// small shared helpers for the AdminModules folder
import { supabase } from "../../../lib/supabaseClient";


/* -------------------------------------------
   READ FROM LOCALSTORAGE
-------------------------------------------- */
export const readLS = (key, fallback) => {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn("readLS error:", err);
    return fallback;
  }
};

/* -------------------------------------------
   WRITE TO LOCALSTORAGE
-------------------------------------------- */
export const writeLS = (key, value) => {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("writeLS error:", err);
  }
};

/* -------------------------------------------
   PUSH ACTIVITY – LOCAL + SUPABASE
-------------------------------------------- */
export const pushActivity = async (message, type = "info") => {
  const entry = {
    id: crypto?.randomUUID?.() || Date.now(),   // safer unique ID
    message,
    type,
    created_at: new Date().toISOString(),
  };

  // Save to local storage
  const old = readLS("ss_activityLog", []);
  const updated = [entry, ...old].slice(0, 200); // keep max 200 latest logs
  writeLS("ss_activityLog", updated);

  // Save to Supabase
  try {
    const { error } = await supabase.from("activity_log").insert({
      message,
      type,
      created_at: entry.created_at,
    });

    if (error) {
      console.error("Supabase activity log error:", error);
    }
  } catch (err) {
    console.error("pushActivity fatal error:", err);
  }
};
