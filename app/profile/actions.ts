"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const avatar = formData.get("avatar");
  let avatarUrl: string | undefined;

  if (firstName.length > 80 || lastName.length > 80) {
    redirect("/profile?error=name-too-long");
  }

  if (avatar instanceof File && avatar.size > 0) {
    const extension = allowedImageTypes.get(avatar.type);
    if (!extension) redirect("/profile?error=image-type");
    if (avatar.size > 2 * 1024 * 1024) redirect("/profile?error=image-size");

    const path = `${user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(path, avatar, { contentType: avatar.type, upsert: true });

    if (uploadError) redirect("/profile?error=upload");
    avatarUrl = supabase.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;
  }

  const changes: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string;
    updated_at: string;
  } = {
    id: user.id,
    first_name: firstName || null,
    last_name: lastName || null,
    updated_at: new Date().toISOString(),
  };
  if (avatarUrl) changes.avatar_url = avatarUrl;

  const { error } = await supabase.from("profiles").upsert(changes);
  if (error) redirect("/profile?error=save");

  revalidatePath("/", "layout");
  redirect("/profile?saved=1");
}
