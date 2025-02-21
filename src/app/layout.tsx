import type { Metadata } from "next";
import { Jersey_25 } from "next/font/google";
import "./globals.css";

const jersey25 = Jersey_25({
  variable: "--font-jersey",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "TOKTAK TYPE",
  description: "Speed type game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jersey25.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
