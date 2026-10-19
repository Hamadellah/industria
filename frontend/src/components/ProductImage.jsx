import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

/** Image produit avec ratio constant et repli élégant si l'image est absente ou ne se charge pas. */
export default function ProductImage({ src, alt, className = '', ratio = 'aspect-square', ...props }) {
  const [failed, setFailed] = useState(false);

  // Une nouvelle URL (image remplacée, liste rechargée) doit être retentée.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`${ratio} flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 ${className}`}>
        <ImageOff className="h-8 w-8" aria-label="Image indisponible" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${ratio} w-full object-cover ${className}`}
      {...props}
    />
  );
}
