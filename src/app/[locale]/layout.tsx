import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Nextjs test',
    description: 'Nextjs test with App router and mongoDB',
}

export function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'de' }];
}

export default async function RootLayout({
    children, params: { locale }
}: {
    children: React.ReactNode, params: any
}) {
    let messages;
    try {
        messages = (await import(`@/messages/${locale}.json`)).default;
    } catch (error) {
        notFound();
    }

    return (
        <html lang='en'>
            <body className={inter.className}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider >
            </body>
        </html>
    )
}
