import './globals.css';
import { JetBrains_Mono } from 'next/font/google';
import Providers from '@/components/Providers';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
