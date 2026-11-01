import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import localFont from "next/font/local";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

// cursive demise doom style font for stylized headers and titles
const bilbo = localFont({
  src: "../../public/fonts/bilboregular.ttf",
  variable: "--font-bilbo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Colorwall Patrons - Support The Vision",
  description: "Become a Colorwall Patron. Get early access to beta builds, exclusive features, and direct communication with the developers building the ultimate Wallpaper Engine alternative.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${bilbo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
