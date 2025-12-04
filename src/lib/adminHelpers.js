// src/lib/adminHelpers.js
import { supabase } from "./supabaseClient";

/**
 * Small shared helpers used across admin pages.
 */

export const now = () => new Date().toISOString();

export async function pushActivityRemote(message, type = "info") {
  try {
    // insert an activity log row
    const { error } = await supabase
      .from("activity_log")
      .insert([{ message, type, created_at: now() }]);
    if (error) throw error;
  } catch (err) {
    // non-blocking: console only
    // keep app usable even if logging fails
    // eslint-disable-next-line no-console
    console.error("pushActivityRemote", err);
  }
}

export async function uploadImageToStorage(file, bucket = "product-images") {
  if (!file) return null;
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: false });
  if (error) throw error;
  const { publicURL, error: urlErr } = supabase.storage.from(bucket).getPublicUrl(data.path);
  if (urlErr) throw urlErr;
  return publicURL;
}
