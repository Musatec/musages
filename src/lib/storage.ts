
import { supabase } from "./supabase";

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The bucket name (default: 'product-images')
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, bucket = 'products') {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 2. Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (error: any) {
    console.error('Error uploading image:', error.message);
    return { success: false, error: error.message };
  }
}
