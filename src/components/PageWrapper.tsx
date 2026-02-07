export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#fafaf9] to-white text-gray-900">
      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]">
        <svg width="100%" height="100%">
          <filter id="page-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#page-noise)" />
        </svg>
      </div>
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
