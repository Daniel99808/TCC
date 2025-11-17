import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Script from 'next/script';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Senai - Sistema Acadêmico",
  description: "Sistema de gestão acadêmica com avisos, calendário e conversas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexus Senai",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  applicationName: "Nexus Senai",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon-180x180.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DarkModeProvider>
          <SidebarProvider>
            {children}
            <PWAInstallPrompt />
          </SidebarProvider>
        </DarkModeProvider>
        
        {/* Service Worker Registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[SW] Service Worker registrado com sucesso:', registration.scope);
                      
                      // Verificar atualizações periodicamente
                      setInterval(() => {
                        registration.update();
                      }, 60000); // A cada 1 minuto
                    },
                    function(err) {
                      console.log('[SW] Falha ao registrar Service Worker:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
