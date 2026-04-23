import type { Metadata } from 'next'
import { Tajawal, Russo_One } from 'next/font/google'
import './globals.css'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import ClientLayout from '@/components/layout/ClientLayout'

const tajawal = Tajawal({ 
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap',
})

const russoOne = Russo_One({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-logo',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://spirit-store.com'),
  title: {
    default: 'Spirit | متجر الإكسسوارات',
    template: '%s | Spirit'
  },
  description: 'متجرك المفضل للإكسسوارات العصرية - حقائب، ساعات، إكسسوارات نسائية ورجالية من أفضل الماركات العالمية. توصيل لجميع أنحاء فلسطين.',
  keywords: ['إكسسوارات', 'حقائب', 'ساعات', 'accessories', 'فلسطين', 'Spirit', 'إكسسوارات نسائية', 'إكسسوارات رجالية'],
  authors: [{ name: 'Spirit' }],
  creator: 'Spirit',
  publisher: 'Spirit',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_PS',
    siteName: 'Spirit',
    title: 'Spirit | متجر الإكسسوارات',
    description: 'متجرك المفضل للإكسسوارات العصرية - حقائب، ساعات، إكسسوارات نسائية ورجالية',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spirit | متجر الإكسسوارات',
    description: 'متجرك المفضل للإكسسوارات العصرية - حقائب، ساعات، إكسسوارات',
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://spirit-store.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${tajawal.className} ${russoOne.variable}`}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <WhatsAppButton />
      </body>
    </html>
  )
}
