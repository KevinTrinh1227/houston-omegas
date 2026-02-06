import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Houston Omegas website.',
};

export default function PrivacyPage() {
  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl mb-10 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Privacy Policy
        </h1>

        <div className="space-y-8 text-gray-500 text-sm leading-relaxed">
          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly through forms on our website, including your name, email address, phone number, and any messages you submit. We also collect standard web analytics data such as IP addresses, browser type, and pages visited.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">2. How We Use Your Information</h2>
            <p>Information submitted through our forms is used solely to respond to your inquiries, process venue rental requests, and communicate relevant updates. We do not sell or share your personal information with third parties for marketing purposes.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">3. Data Storage</h2>
            <p>Your information is stored securely and retained only as long as necessary to fulfill the purposes described in this policy. Form submissions are processed through secure channels.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">4. Cookies</h2>
            <p>Our website may use cookies and similar technologies to enhance your browsing experience. These are used for basic analytics and website functionality. You can disable cookies in your browser settings.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">5. Third-Party Services</h2>
            <p>We may use third-party services for analytics (such as Cloudflare Web Analytics) and form processing. These services have their own privacy policies governing the use of your information.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">6. Your Rights</h2>
            <p>You may request to access, correct, or delete your personal information at any time by contacting us at events@houstonomegas.com. We will respond to your request within a reasonable timeframe.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">7. Children&apos;s Privacy</h2>
            <p>Our website is not directed at children under 13 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 13, we will delete it promptly.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Your continued use of the website constitutes acceptance of the updated policy.</p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">9. Contact</h2>
            <p>For questions about this Privacy Policy, contact us at events@houstonomegas.com.</p>
          </div>

          <p className="text-gray-300 text-xs pt-4">Last updated: February 2026</p>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
