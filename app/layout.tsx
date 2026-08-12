import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
