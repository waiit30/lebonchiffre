import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';

export default function ProductGallery({ product }) {
  const gallery = (product.images && product.images.length > 0 ? product.images : [product.image_url]).filter(Boolean);
  const [active, setActive] = useState(0);

  useEffect(() => { setActive(0); }, [product.id]);

  if (gallery.length === 0) return null;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden border border-border bg-secondary">
        <Image src={gallery[active]} alt={product.name} className="h-full w-full object-cover" fittingType="fill" />
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {gallery.map((g, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden border bg-secondary transition-colors ${i === active ? "border-cyan-400" : "border-border hover:border-cyan-400/50"}`}
            >
              <Image src={g} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" fittingType="fill" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}