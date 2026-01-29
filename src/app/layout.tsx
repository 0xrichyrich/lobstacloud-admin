import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LobstaCloud Admin",
  description: "Admin dashboard for LobstaCloud gateway management",
  metadataBase: new URL('https://admin.redlobsta.com'),
  openGraph: {
    title: "LobstaCloud Admin",
    description: "Admin dashboard for LobstaCloud gateway management",
    url: "https://admin.redlobsta.com",
    siteName: "LobstaCloud Admin",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LobstaCloud Admin",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LobstaCloud Admin",
    description: "Admin dashboard for LobstaCloud gateway management",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
