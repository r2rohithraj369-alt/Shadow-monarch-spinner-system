import { getSupabase } from "./supabaseClient";

export const AVATAR_BUCKET =
  import.meta.env.VITE_SUPABASE_AVATAR_BUCKET || "profile-images";

async function ensureAvatarBucketAvailable(supabase: any) {
  const { data, error } = await supabase.storage.getBucket(AVATAR_BUCKET);
  if (!error && data) return;

  const message = error?.message || "";
  if (message.toLowerCase().includes("not found")) {
    throw new Error(
      `Supabase Storage bucket '${AVATAR_BUCKET}' was not found. Create a public bucket named '${AVATAR_BUCKET}' in Supabase Storage, or set VITE_SUPABASE_AVATAR_BUCKET to the bucket your project uses.`
    );
  }

  throw new Error(`Unable to access Supabase Storage bucket '${AVATAR_BUCKET}': ${message || "unknown storage error"}`);
}

/**
 * Uploads a profile avatar image Blob to Supabase Storage.
 * Uses the public avatar bucket configured by VITE_SUPABASE_AVATAR_BUCKET,
 * defaulting to "profile-images".
 */
export async function uploadAvatarToSupabase(userId: string, blob: Blob): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not configured. Running in offline local mode.");
  }

  const fileExt = blob.type.split("/")[1] || "webp";
  const filePath = `${userId}/avatar.${fileExt}`;

  await ensureAvatarBucketAvailable(supabase);

  // Upload the blob (upsert: true replaces existing file)
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true
    });

  if (error) {
    console.error("Supabase Storage upload error details:", error);
    throw error;
  }

  // Get the public URL of the uploaded image
  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase Storage.");
  }

  // Return public URL with cache-busting timestamp to trigger immediate re-renders in UI
  return `${urlData.publicUrl}?t=${Date.now()}`;
}

/**
 * Deletes any existing avatar files for a user from Supabase Storage.
 */
export async function deleteAvatarFromSupabase(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  // Attempt to clear all potential extensions
  const paths = [
    `${userId}/avatar.webp`,
    `${userId}/avatar.jpg`,
    `${userId}/avatar.jpeg`,
    `${userId}/avatar.png`
  ];

  try {
    const { error } = await supabase.storage.from(AVATAR_BUCKET).remove(paths);
    if (error) {
      console.warn("Non-fatal Supabase Storage delete warning:", error.message);
    }
  } catch (e) {
    console.error("Supabase Storage delete operation failed:", e);
  }
}
