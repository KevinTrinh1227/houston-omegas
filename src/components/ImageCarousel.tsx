'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

const images = [
  { src: '/images/brothers.jpg', alt: 'Brotherhood' },
  { src: '/images/gallery-5.jpg', alt: 'Event' },
  { src: '/images/gallery-2.jpg', alt: 'UNITY Talent Show' },
  { src: '/images/gallery-1.jpg', alt: 'Dinner' },
  { src: '/images/gallery-7.jpg', alt: 'Photoshoot' },
];

export default function ImageCarousel() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % images.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="relative w-full h-full">
      {images.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          className={`object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === active ? 'bg-white w-3' : 'bg-white/50'}`}
            aria-label={`Show image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
