import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Houston Omegas website.',
};

export default function TermsPage() {
  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl mb-10 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Terms of Service
        </h1>

        <div className="space-y-8 text-gray-500 text-sm leading-relaxed">
          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the Houston Omegas website (houstonomegas.com), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">2. Use of Website</h2>
            <p>This website is provided for informational purposes about Houston Omegas. You may use this website for lawful purposes only. You agree not to use the website in any way that could damage, disable, or impair the website or interfere with any other party&apos;s use.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">3. Venue Rental</h2>
            <p>All venue rental inquiries submitted through this website are subject to availability and confirmation. Submitting an inquiry does not guarantee a reservation. Rental terms, pricing, deposits, and cancellation policies will be communicated separately upon confirmation.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">4. Intellectual Property</h2>
            <p>All content on this website, including text, images, logos, and design, is the property of Houston Omegas or its licensors and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works without written permission.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">5. User Submissions</h2>
            <p>By submitting information through forms on this website (inquiry forms, interest forms, contact forms), you consent to Houston Omegas collecting and using that information to respond to your inquiry and for related operational purposes.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">6. Disclaimer</h2>
            <p>This website is provided &quot;as is&quot; without warranties of any kind, either express or implied. Houston Omegas does not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">7. Limitation of Liability</h2>
            <p>Houston Omegas shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of this website or any information obtained through it.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">8. Changes to Terms</h2>
            <p>We reserve the right to update these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the website constitutes acceptance of the updated terms.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">9. Contact</h2>
            <p>For questions regarding these Terms of Service, please contact us at events@houstonomegas.com.</p>
          </div>

          <p className="text-gray-300 text-xs pt-4">Last updated: February 2026</p>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
