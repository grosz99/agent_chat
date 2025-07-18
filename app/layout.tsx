import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Surge",
  description: "Don't keep pace - surge ahead",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
