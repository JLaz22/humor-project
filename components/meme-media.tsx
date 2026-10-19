"use client";

import { useState } from "react";

export function MemeMedia({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="meme-media mt-6">
      {failed ? (
        <div className="meme-image-unavailable">Photo unavailable. The punchline lives on.</div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
