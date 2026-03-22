import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FileProvider } from "@/context/FileContext";

export const metadata: Metadata = {
  title: {
    default: "FetchP2P - Secure Peer-to-Peer File Transfer",
    template: "%s | FetchP2P"
  },
  description: "Send files instantly, peer-to-peer. No accounts, no size limits, no servers. Drop a file. Link a friend. Done.",
  keywords: ["P2P", "File Transfer", "Peer-to-Peer", "Secure", "Private", "Send Files", "WebRTC"],
  authors: [{ name: "FetchP2P Team" }],
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
    creator: "@fetchp2p",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: {
    index: true,
    follow: true,
  },
};

import SWRegistration from "@/components/SWRegistration";
import { Footer } from "@/components/ui/Footer";

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
                "Real-time transfer tracking"
              ]
            })
          }}
        />
        <SWRegistration />
        <FileProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <main className="min-h-screen flex flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </main>
          </ThemeProvider>
        </FileProvider>
      </body>
    </html>
  );
}
