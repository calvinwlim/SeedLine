import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';
import { QueryProvider } from '../lib/query-provider';
import { AuthProvider } from '../lib/auth/auth-context';
import { ThemeProvider, themeInitScript } from '../lib/theme';
import { SiteHeader } from '../components/layout/site-header';
import { SiteFooter } from '../components/layout/site-footer';
import './globals.css';
// Leaflet's stylesheet is pure CSS (no `window` access), so it loads globally
// here rather than inside the dynamically-imported map component. Keeping it out
// of a lazily-loaded chunk avoids the dev-mode "Loading CSS chunk failed" error
// when a chunk is re-hashed across recompiles.
import 'leaflet/dist/leaflet.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700'],
});
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'OpenMat — Tournament management for grappling',
  description:
    'Registration, brackets, and matside scoring for grappling and combat-sports tournaments — built to keep working on event day.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <div className="flex-1">{children}</div>
                <SiteFooter />
              </div>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
