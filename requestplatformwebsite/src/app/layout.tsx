import './globals.css';
import { JetBrains_Mono } from 'next/font/google';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

//font subject to change
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['500', '600', '700'],
});

export const metadata = {
  title: 'Electrium Mobility Task Platform',
  description: 'Task management hub for Electrium Mobility teams.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jetbrains.variable} style={{ fontFamily: 'var(--font-jetbrains)' }}>
        <Providers>
          {children}
          <Toaster position="top-center" toastOptions={{
            duration: 3000,
            success: { style: { background: '#1f8f3a', color: '#fff' } },
            error: { style: { background: '#b43232', color: '#fff' } },
          }} />
        </Providers>
      </body>
    </html>
  );
}
