import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | PayMapper',
  description: 'Terms of Service for PayMapper — the global salary comparison platform.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-white">Terms of Service</span>
      </nav>

      <h1 className="mb-8 text-3xl font-extrabold sm:text-4xl">Terms of Service</h1>

      <div className="space-y-6 text-slate-300 leading-relaxed">
        <p className="text-slate-400 text-sm">Last updated: March 2026</p>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using PayMapper (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">2. Description of Service</h2>
          <p>
            PayMapper provides salary comparison data, cost of living information, and tax
            estimates for informational purposes only. The data presented is aggregated from
            public sources and should not be considered financial, legal, or tax advice.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">3. Accuracy of Information</h2>
          <p>
            While we strive to keep information accurate and up to date, we make no warranties
            or representations about the accuracy, completeness, or reliability of any data
            displayed on the platform. Salary figures, tax rates, and cost of living data are
            estimates and may vary based on individual circumstances.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">4. Use of the Service</h2>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Scrape or collect data from the Service in an automated manner without prior consent</li>
            <li>Attempt to interfere with or disrupt the Service or its infrastructure</li>
            <li>Use the Service for any commercial purpose without authorization</li>
            <li>Reproduce, distribute, or create derivative works from the Service content</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">5. Intellectual Property</h2>
          <p>
            All content, design, and data compilations on PayMapper are the property of
            PayMapper and are protected by applicable intellectual property laws. Individual
            data points sourced from public datasets retain their original licensing terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">6. Limitation of Liability</h2>
          <p>
            PayMapper shall not be liable for any direct, indirect, incidental, or
            consequential damages arising from your use of the Service. This includes, but is
            not limited to, any decisions made based on the salary, tax, or cost of living
            data provided.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective
            immediately upon posting. Your continued use of the Service constitutes acceptance
            of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">8. Contact</h2>
          <p>
            If you have questions about these Terms, please contact us at{' '}
            <a href="mailto:contact@paymapper.app" className="text-[#3b82f6] hover:underline">
              contact@paymapper.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
