import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ገቢ ወጪ Tracker',
  description: 'Track your financial transactions',
  generator: 'Next.js',
  manifest: '/manifest.json',
  authors: [{ name: 'Abivmsul' }],

  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ገቢ ወጪ',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        {/* <meta name="viewport" content="width=device-width, initial-scale=1.0" /> */}
        {/* iOS PWA Config */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Finance Tracker" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <main className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
            <Toaster position="top-center" richColors />
          </div>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('ServiceWorker registration successful');
                    })
                    .catch(err => {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />
        </main>
      </body>
    </html>
  )
}