import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
      <div className="text-center px-6">
        <Image src="/images/omega-logo.jpg" alt="Houston Omegas" width={64} height={64} className="w-16 h-16 rounded-lg mx-auto mb-8 object-cover" />
        <h1 className="text-white text-2xl sm:text-3xl font-semibold tracking-[0.08em] uppercase mb-4">Houston Omegas</h1>
        <p className="text-[#666] text-sm tracking-[0.2em] uppercase">Coming Soon</p>
      </div>
    </div>
  );
}
