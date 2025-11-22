import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "TeleMedix – Instant Telemedicine Care Anytime, Anywhere",
  description:
    "Connect with certified doctors, book online consultations, and get AI-powered health suggestions instantly. TeleMedix provides 24/7 virtual healthcare support.",

  keywords: [
    "telemedicine",
    "online doctor",
    "virtual healthcare",
    "doctor consultation",
    "AI health assistant",
    "online medical service",
    "healthcare platform",
  ],

  authors: [{ name: "TeleMedix Team" }],

  openGraph: {
    title: "TeleMedix – Instant Telemedicine Care Anytime, Anywhere",
    description:
      "Book instant doctor consultations, access AI health guidance, and connect with experts 24/7.",
    url: "https://your-domain.com",
    siteName: "TeleMedix",
    images: [
      {
        url: "/og-image.jpg", // replace with your OG image
        width: 1200,
        height: 630,
        alt: "TeleMedix Telemedicine Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "TeleMedix – Online Doctor Consultation & AI Health Assistant",
    description:
      "Get instant medical care, book appointments, and use AI-powered health suggestions online.",
    images: ["/og-image.jpg"], // replace
  },

  icons: {
    icon: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
