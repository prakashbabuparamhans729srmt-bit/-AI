import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { SupportChatbot } from '@/components/support-chatbot';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'कुलगुरु AI - हर परिवार का अपना कुलगुरु',
  description: 'धर्म, तर्क और विज्ञान का संगम - अब आपके घर पर।',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'कुलगुरु AI',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [
      { url: 'https://picsum.photos/seed/kulguru-logo/180/180', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#FF4F00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Tiro+Devanagari+Hindi:ital@0;1&family=Premchand:wght@400&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/kulguru-logo/180/180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FF4F00" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
            <SupportChatbot />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}