import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | PayMapper',
  description: 'Privacy Policy for PayMapper — the global salary comparison platform.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-white">Privacy Policy</span>
      </nav>

      <h1 className="mb-8 text-3xl font-extrabold sm:text-4xl">Privacy Policy</h1>

      <div className="space-y-6 text-slate-300 leading-relaxed">
        <p className="text-slate-400 text-sm">Last updated: March 2026</p>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">1. Information We Collect</h2>
          <p>
            PayMapper is designed to be privacy-friendly. We collect minimal information to
            provide and improve our Service:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Usage data:</strong> Pages visited, search queries, and interaction patterns (anonymized)</li>
            <li><strong>Technical data:</strong> Browser type, device type, and IP address (for security and analytics)</li>
            <li><strong>Cookies:</strong> Essential cookies for site functionality and optional analytics cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide and maintain the Service</li>
            <li>Improve user experience and site performance</li>
            <li>Analyze usage trends and popular content</li>
            <li>Prevent abuse and maintain security</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">3. Third-Party Services</h2>
          <p>We may use the following third-party services:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Google Analytics:</strong> For understanding how users interact with the Service</li>
            <li><strong>Google AdSense:</strong> For displaying relevant advertisements</li>
          </ul>
          <p className="mt-2">
            These services may collect information in accordance with their own privacy
            policies. We encourage you to review their respective policies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">4. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may
            share anonymized, aggregated data for analytical purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">5. Data Retention</h2>
          <p>
            We retain usage data for a reasonable period necessary to fulfill the purposes
            outlined in this policy. You may request deletion of any personal data by
            contacting us.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Opt out of analytics tracking</li>
            <li>Request a copy of your data in a portable format</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">7. Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your
            data. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of any
            material changes by updating the &quot;Last updated&quot; date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">9. Contact</h2>
          <p>
            For privacy-related inquiries, please contact us at{' '}
            <a href="mailto:privacy@paymapper.com" className="text-[#3b82f6] hover:underline">
              privacy@paymapper.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
