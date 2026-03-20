import type { Metadata, Viewport } from "next";
import "./globals.less";

export const metadata: Metadata = {
  title: "Hector",
  description: "Smart task management with time tracking",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
