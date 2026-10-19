// A bounded photo library keeps AI choices tied to real, stable image URLs.
// The model may select IDs only; it never invents a photo URL.
export const memePhotos = [
  { id: "city", photo: "1485871981521-5b1fd3805eee", description: "New York skyline and dense city buildings; big-city life and ambition" },
  { id: "bridge", photo: "1518391846015-55a9cc003b25", description: "Illuminated New York bridge and river at dusk; crossing the city, evening plans and city life" },
  { id: "coffee", photo: "1509042239860-f550ce710b93", description: "Three latte-art coffees among plants on a cafe table; caffeine, mornings and cafe studying" },
  { id: "library", photo: "1507842217343-583bb7270b66", description: "Towering library shelves full of books; studying, exams and academic pressure" },
  { id: "laptop", photo: "1496181133206-80ce9b88a853", description: "Open laptop on a desk; work, deadlines and technology" },
  { id: "dog", photo: "1552053831-71594a27632d", description: "Golden retriever sitting with a flower in its mouth; hopeful, friendly and earnest reactions" },
  { id: "cat", photo: "1514888286974-6c03e2ca1dba", description: "A black-and-white cat leaning its paws over a ledge; unimpressed, skeptical and aloof reactions" },
  { id: "pizza", photo: "1513104890138-7c749659a591", description: "A pizza; late-night food, hunger, comfort food and cravings" },
  { id: "tacos", photo: "1511690078903-71dc5a49f5e3", description: "A platter of avocado tacos, corn, salsa and dips; food cravings, dinner plans and treating yourself" },
  { id: "beach", photo: "1507525428034-b723cf961d3e", description: "A sunny tropical beach; relaxation, escaping work and vacation daydreams" },
  { id: "mountains", photo: "1464822759023-fed622ff2c3b", description: "Forested valley with mountain peaks and a distant lake; getting away, perspective and the outdoors" },
  { id: "plants", photo: "1416879595882-3373a0480b5b", description: "Potting soil, a gardening scoop and tiny plants on a table; plant parenting, new beginnings and making a mess" },
] as const;

export type MemePhotoId = typeof memePhotos[number]["id"];

export function findMemePhoto(id: string) {
  return memePhotos.find((photo) => photo.id === id);
}

export function memePhotoUrl(photo: typeof memePhotos[number]) {
  return `https://images.unsplash.com/photo-${photo.photo}?auto=format&fit=crop&w=1200&q=85`;
}

export function pickMatchingPhoto(ids: unknown, random = Math.random) {
  if (!Array.isArray(ids)) return undefined;
  const matches = [...new Set(ids.filter((id): id is string => typeof id === "string"))]
    .map(findMemePhoto).filter((photo) => photo !== undefined).slice(0, 3);
  return matches.length ? matches[Math.floor(random() * matches.length)] : undefined;
}
