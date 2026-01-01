'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const authPaths = ['/connexion', '/inscription', '/register', '/connexion/erreur', '/login'];
  const showNavbar = !authPaths.includes(pathname);

  // Effet pour s'assurer que la page commence en haut et empêcher le défilement automatique
  useEffect(() => {
    // Remonter en haut de la page au chargement
    window.scrollTo(0, 0);
    
    // Empêcher le comportement de défilement automatique
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, [pathname]);

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col overflow-x-hidden`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {showNavbar && <Header />}
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-gray-800 text-white p-4 mt-8">
              <div className="container mx-auto text-center">
                <p>© {new Date().getFullYear()} Votre Application. Tous droits réservés.</p>
              </div>
            </footer>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
