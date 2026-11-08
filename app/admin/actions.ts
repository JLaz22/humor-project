"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/console/auth";
import { resources } from "@/lib/console/resources";

type Result = { error?: string; success?: string };

function allowed(resource: string) {
  const config = resources[resource];
  if (!config || config.mode === "read") throw new Error("Unsupported resource");
  return config;
}

function values(resource: string, form: FormData) {
  const config = allowed(resource);
  return Object.fromEntries(config.fields.map((field) => {
    let value: string | boolean | number = String(form.get(field.key) ?? "").trim();
    if (field.type === "checkbox") value = form.get(field.key) === "on";
    if (field.type === "number") value = Number(value);
    return [field.key, value];
  }));
}

export async function saveResource(_state: Result, form: FormData): Promise<Result> {
  try {
    const resource = String(form.get("resource") ?? "");
    const id = String(form.get("id") ?? "");
    const dbValues = values(resource, form);
    const { db } = await requireAdmin();
    const result = id
      ? await db.from(resource).update(dbValues).eq("id", id)
      : await db.from(resource).insert(dbValues);
    if (result.error) return { error: result.error.message };
    revalidatePath(`/admin/${resource}`); revalidatePath("/admin");
    return { success: id ? "Updated." : "Created." };
  } catch { return { error: "Could not save this item." }; }
}

export async function deleteResource(_state: Result, form: FormData): Promise<Result> {
  try {
    const resource = String(form.get("resource") ?? "");
    allowed(resource);
    const { db } = await requireAdmin();
    const { error } = await db.from(resource).delete().eq("id", String(form.get("id")));
    if (error) return { error: error.message };
    revalidatePath(`/admin/${resource}`); revalidatePath("/admin");
    return { success: "Deleted." };
  } catch { return { error: "Could not delete this item." }; }
}

export async function uploadImage(_state: Result, form: FormData): Promise<Result> {
  try {
    const image = form.get("image"); const alt = String(form.get("alt") ?? "").trim();
    if (!(image instanceof File) || image.size === 0 || !alt) return { error: "Choose an image and add a description." };
    if (image.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(image.type)) return { error: "Use a JPG, PNG, or WebP image up to 3 MB." };
    const { db, user } = await requireAdmin();
    const extension = image.type === "image/jpeg" ? "jpg" : image.type.split("/")[1];
    const storagePath = `${user.id}/library/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await db.storage.from("meme-photos").upload(storagePath, image, { contentType: image.type });
    if (uploadError) return { error: uploadError.message };
    const url = db.storage.from("meme-photos").getPublicUrl(storagePath).data.publicUrl;
    const { error } = await db.from("images").insert({ url, storage_path: storagePath, alt });
    if (error) { await db.storage.from("meme-photos").remove([storagePath]); return { error: error.message }; }
    revalidatePath("/admin/images"); revalidatePath("/admin");
    return { success: "Image uploaded." };
  } catch { return { error: "Could not upload image." }; }
}
