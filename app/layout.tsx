import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./assessment/assessment-responsive.css";

export const metadata: Metadata = {
  title: "PrivacyMap India",
  description:
    "Discover where your business collects personal data and understand your privacy risk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
