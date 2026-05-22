import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSINF — Open Source Intelligence Feed",
  description: "Personal OSINF dashboard — aggregated feeds across geopolitical, cyber, maritime, aviation, and environmental domains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-mono antialiased min-h-screen">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const saved = localStorage.getItem('osinf-theme');
    const theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  } catch {}
})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
