"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              At HyounKunun, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and contact information</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Location data</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6">Usage Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and features used</li>
              <li>Time and date of visits</li>
              <li>Referring website addresses</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Improve user experience</li>
              <li>Process transactions</li>
              <li>Send administrative information</li>
              <li>Provide customer support</li>
              <li>Ensure platform security</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Other users (as necessary for transactions)</li>
              <li>Service providers and business partners</li>
              <li>Law enforcement (when required by law)</li>
            </ul>
            <p className="mt-4">
              We do not sell or rent your personal information to third parties for their marketing purposes without your explicit consent.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate technical and organizational security measures to protect your information. However, no security system is impenetrable and we cannot guarantee the security of our systems 100%.
            </p>
            <p>
              We recommend that you also take steps to protect your information by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Using strong passwords</li>
              <li>Not sharing your account credentials</li>
              <li>Logging out after using our services</li>
              <li>Being cautious when sharing personal information</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Withdraw consent</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have questions about this Privacy Policy or our practices, please contact us at:
            </p>
            <ul className="list-none space-y-2">
              <li>Email: privacy@hyounkunun.com</li>
              <li>Phone: +91 1234567890</li>
              <li>Address: [Your Business Address]</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 