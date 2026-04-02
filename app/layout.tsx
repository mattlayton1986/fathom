import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Fathom",
  description: "Inspect and understand JSON API responses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var isLight = theme === 'light' ||
                  (theme !== 'dark' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isLight) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch(e) {}
            })();
          `
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
