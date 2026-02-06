import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Disclaimer and legal notice for Houston Omegas.',
};

export default function DisclaimerPage() {
  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl mb-10 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Disclaimer
        </h1>

        <div className="space-y-8 text-gray-500 text-sm leading-relaxed">
          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">Independence &amp; Affiliation Notice</h2>
            <p>
              Houston Omegas is an <strong className="text-gray-700">independent organization</strong> based in Houston, Texas. We are not affiliated with, endorsed by, or representative of any university, college, or educational institution. We are not a chapter of, or otherwise connected to, any national fraternity or sorority organization.
            </p>
            <p className="mt-3">
              Houston Omegas operates solely as its own group. Any references to universities, Greek organizations, or other entities on this website are for informational context only and do not imply any official relationship, endorsement, or sponsorship.
            </p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">Content Disclaimer</h2>
            <p>
              The views, opinions, and content published on this website are those of Houston Omegas and its members. They do not represent the views or positions of any university, national organization, or other third party.
            </p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">Venue Operations</h2>
            <p>
              Omega Mansion is a privately owned and operated property. It is not owned by, affiliated with, or managed by any university or national organization. All venue rental inquiries, bookings, and operations are handled independently by Houston Omegas.
            </p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">Trademarks</h2>
            <p>
              All trademarks, service marks, and logos referenced on this website are the property of their respective owners. Use of any third-party marks is for identification purposes only and does not imply sponsorship or endorsement.
            </p>
          </div>

          <div>
            <h2 className="text-gray-800 text-base font-semibold mb-3">Contact</h2>
            <p>For questions regarding this disclaimer, please contact us at events@houstonomegas.com.</p>
          </div>

          <p className="text-gray-300 text-xs pt-4">Last updated: February 2026</p>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
