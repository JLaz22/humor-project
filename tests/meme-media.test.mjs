import assert from "node:assert/strict";
import test from "node:test";
import { pickMatchingPhoto, memePhotoUrl } from "../lib/meme-photos.ts";
import { detectPhotoType } from "../lib/meme-upload.ts";

test("AI photo choices only resolve real library IDs, never invented URLs", () => {
  assert.equal(pickMatchingPhoto(["https://untrusted.example/photo.jpg", "invented"]), undefined);
  assert.equal(pickMatchingPhoto(null), undefined);
  assert.equal(pickMatchingPhoto({ id: "cat" }), undefined);
  const photo = pickMatchingPhoto(["invented", "coffee"], () => 0);
  assert.equal(photo.id, "coffee");
  assert.match(memePhotoUrl(photo), /^https:\/\/images\.unsplash\.com\/photo-/);
});

test("randomness stays inside the matching set and duplicate IDs don't bias it", () => {
  assert.equal(pickMatchingPhoto(["coffee", "coffee", "cat"], () => 0).id, "coffee");
  assert.equal(pickMatchingPhoto(["coffee", "coffee", "cat"], () => 0.5).id, "cat");
  assert.equal(pickMatchingPhoto(["coffee", "cat"], () => 0.999).id, "cat");
  assert.equal(pickMatchingPhoto([], () => 0), undefined);
});

test("photo signatures reject renamed SVG, GIF and empty files", () => {
  assert.equal(detectPhotoType(new TextEncoder().encode("<svg></svg>")), undefined);
  assert.equal(detectPhotoType(new TextEncoder().encode("GIF89a")), undefined);
  assert.equal(detectPhotoType(new Uint8Array()), undefined);
  assert.equal(detectPhotoType(new Uint8Array([0xff, 0xd8])), undefined);
  assert.equal(detectPhotoType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(detectPhotoType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), "image/png");
  assert.equal(detectPhotoType(new TextEncoder().encode("RIFF0000WEBP")), "image/webp");
  assert.equal(detectPhotoType(new TextEncoder().encode("RIFF0000WAVE")), undefined);
});
