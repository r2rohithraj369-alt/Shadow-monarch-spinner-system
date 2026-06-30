import { getSupabase } from "./supabaseClient";

/**
 * Uploads a profile avatar image Blob to Supabase Storage.
 * Auto-creates the "profile-images" bucket if it doesn't exist yet.
 */
export async function uploadAvatarToSupabase(userId: string, blob: Blob): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not configured. Running in offline local mode.");
  }

  const fileExt = blob.type.split("/")[1] || "webp";
  const filePath = `${userId}/avatar.${fileExt}`;

  // Ensure bucket exists by attempting to create it
  try {
    await supabase.storage.createBucket("profile-images", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      fileSizeLimit: 5242880 // 5 MB
    });
  } catch (e) {
    // Ignore error if bucket already exists
    console.log("Bucket 'profile-images' check/creation complete:", e);
  }

  // Upload the blob (upsert: true replaces existing file)
  const { data, error } = await supabase.storage
    .from("profile-images")
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
    .from("profile-images")
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
    const { error } = await supabase.storage.from("profile-images").remove(paths);
    if (error) {
      console.warn("Non-fatal Supabase Storage delete warning:", error.message);
    }
  } catch (e) {
    console.error("Supabase Storage delete operation failed:", e);
  }
}
