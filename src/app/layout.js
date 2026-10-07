import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { isIndexable, siteDescription, siteName, siteTitle, siteUrl } from "../site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: siteUrl || new URL("http://localhost:3000"),
  title: { default: siteTitle, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: "Canyon Careers",
  ...(siteUrl ? { alternates: { canonical: siteUrl.href } } : {}),
  robots: { index: isIndexable, follow: isIndexable },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: siteTitle,
    description: siteDescription,
    ...(siteUrl ? { url: siteUrl.href } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#234436",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
