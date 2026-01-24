'use client';

import Link from 'next/link';
import { FileText, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Complete PDF</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Disclaimer</h1>
        <p className="text-gray-500 mb-8">Last updated: January 24, 2026</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            Please read this disclaimer carefully before using Complete PDF services.
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Information</h2>
            <p className="text-gray-600 mb-4">
              The information and tools provided on Complete PDF are for general informational and utility purposes only. While we strive to provide accurate and functional tools, we make no representations or warranties regarding the accuracy, reliability, or completeness of any content or functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Warranty</h2>
            <p className="text-gray-600 mb-4">
              Complete PDF is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy of results</li>
              <li>Uninterrupted or error-free operation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              In no event shall Complete PDF, its developer, or any affiliated parties be liable for any direct, indirect, incidental, consequential, special, or exemplary damages arising out of or in connection with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Your use or inability to use the service</li>
              <li>Any loss or corruption of data</li>
              <li>Any errors or inaccuracies in the service</li>
              <li>Any unauthorized access to your files</li>
              <li>Any third-party content or services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">File Processing</h2>
            <p className="text-gray-600 mb-4">
              While all file processing occurs locally in your browser and files are not uploaded to our servers, we recommend:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Always keeping backups of important documents</li>
              <li>Verifying the output of any processed files</li>
              <li>Not relying solely on our tools for critical or legal documents</li>
              <li>Using appropriate security measures on your own device</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Advice</h2>
            <p className="text-gray-600 mb-4">
              Complete PDF is not a substitute for professional services. For legal, financial, medical, or other important documents, we recommend consulting with appropriate professionals before making decisions based on processed documents.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">External Links</h2>
            <p className="text-gray-600 mb-4">
              Our website may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or terms of service of these external sites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Disclaimer</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to update this disclaimer at any time. Changes will be effective immediately upon posting on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
            <p className="text-gray-600">
              If you have any questions about this disclaimer, please contact:<br />
              Email: idikudakarthik55@gmail.com<br />
              Developer: <a href="https://www.karthikidikuda.dev" className="text-red-500 hover:underline">Karthik Idikuda</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
