'use client';

import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 24, 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Complete PDF ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              <strong>Files You Upload:</strong> When you use our PDF tools, your files are processed directly in your browser. We do not upload, store, or have access to your files on our servers.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Usage Data:</strong> We may collect anonymous usage statistics such as page views, tool usage frequency, and browser type to improve our services.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Payment Information:</strong> If you choose to support us through our donation feature, payment processing is handled by Razorpay. We do not store your payment card details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Process Your Files</h2>
            <p className="text-gray-600 mb-4">
              All PDF processing occurs locally in your browser using client-side JavaScript. Your files never leave your device and are not transmitted to our servers. Once you close your browser tab, all processed files are automatically removed from memory.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We do not retain any of your files or personal data. Your files exist only in your browser's memory during processing and are automatically deleted when you close the browser or navigate away from the page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
            <p className="text-gray-600 mb-4">
              We may use essential cookies to ensure the proper functioning of our website. These cookies do not track your personal information or browsing history across other websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Third-Party Services</h2>
            <p className="text-gray-600 mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Razorpay for payment processing (for donations)</li>
              <li>Analytics services for anonymous usage tracking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              Since we do not store your personal data or files, there is no data to access, modify, or delete. If you have any concerns about your privacy, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: idikudakarthik55@gmail.com<br />
              Website: <a href="https://www.karthikidikuda.dev" className="text-red-500 hover:underline">karthikidikuda.dev</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
