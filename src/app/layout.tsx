import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FileProvider } from "@/context/FileContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://fetch.1ceit.com"),
  title: {
    default: "FetchP2P - Secure Peer-to-Peer File Transfer",
    template: "%s | FetchP2P"
  },
  description: "Send files instantly, peer-to-peer. No accounts, no size limits, no servers. Drop a file. Link a friend. Done.",
  keywords: ["P2P", "File Transfer", "Peer-to-Peer", "Secure", "Private", "Send Files", "WebRTC", "Browser-Based", "No Size Limits", "Instant Transfer", "Fetch P2P", "File Sharing", "File Transfer", "Secure File Transfer", "Private File Sharing"],
  authors: [{ name: "CJ Artz" }],
  creator: "FetchP2P",
  publisher: "FetchP2P",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "FetchP2P - Secure Peer-to-Peer File Transfer",
    description: "Instant, private P2P file sharing directly in your browser.",
    url: "https://fetch.1ceit.com",
    siteName: "FetchP2P",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FetchP2P - Secure Peer-to-Peer File Transfer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FetchP2P - Secure Peer-to-Peer File Transfer",
    description: "Instant, private P2P file sharing directly in your browser.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://fetch.1ceit.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

import SWRegistration from "@/components/SWRegistration";
import { Footer } from "@/components/ui/Footer";
import { LenisProvider } from "@/components/LenisProvider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "FetchP2P",
              "alternateName": "Fetch P2P",
              "url": "https://fetch.1ceit.com",
              "image": "https://fetch.1ceit.com/og-image.png",
              "operatingSystem": "any",
              "applicationCategory": "UtilitiesApplication",
              "description": "Secure, peer-to-peer file transfer directly in the browser with no size limits.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Peer-to-peer encryption",
                "Unlimited file size",
                "No server storage",
                "Real-time transfer tracking",
                "Cross-platform support",
                "Open source"
              ]
            })
          }}
        />
        <SWRegistration />
        <FileProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LenisProvider>
              <main className="min-h-screen flex flex-col">
                <div className="flex-1">{children}</div>
                <Footer />
              </main>
            </LenisProvider>
          </ThemeProvider>
        </FileProvider>
      </body>
    </html>
  );
}
