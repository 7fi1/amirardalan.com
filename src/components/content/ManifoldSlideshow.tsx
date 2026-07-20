'use client';

import { CldImage } from 'next-cloudinary';
import { useEffect, useState } from 'react';

// Cloudinary public IDs for the manifold.observer screenshots (folder: Work).
// Paste the public ID for each screenshot below, e.g. 'Work/manifold-observer-1'.
const images = [
  'Work/manifold-orbital-MNF-09YPON9O_4_uwdfqu',
  'Work/manifold-mandala-MNF-9LQOWU_2_ggmbwv',
  'Work/manifold-wormhole-MNF-0NU0MXZC_q5wpta',
  'Work/manifold-helix-MNF-0EL5C2U8_fmka99',
  'Work/manifold-observer-3_lvy9qm',
  'Work/manifold-terrain-MNF-03RSVFL5_fizyhn.png',
];

const FRAME_DURATION = 9000;

export default function ManifoldSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setActiveIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, FRAME_DURATION);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <a
      href="https://manifold.observer"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit manifold.observer"
      className="relative min-h-[320px] overflow-hidden sm:min-h-[440px] md:col-span-7 lg:min-h-[560px]"
    >
      {images.map((publicId, index) => (
        <CldImage
          key={publicId}
          src={publicId}
          alt=""
          fill
          priority={index === 0}
          sizes="(min-width: 768px) 58vw, 100vw"
          className={`object-cover object-center transition-[opacity,transform] duration-[1800ms] ease-in-out motion-reduce:transition-none ${
            index === activeIndex
              ? 'opacity-100 group-hover:scale-[1.02]'
              : 'opacity-0'
          }`}
        />
      ))}
    </a>
  );
}
