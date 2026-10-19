export const MAX_MEME_PHOTO_BYTES = 3 * 1024 * 1024;
export const MEME_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Verify file signatures as well as the browser-supplied MIME type. SVG and
// animated formats are intentionally excluded from public uploads.
export function detectPhotoType(bytes: Uint8Array): string | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
}
