import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { NavBar } from '@/components/misc/clientComponents'

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
    // name must be a string that is a key in the translate.tsx file
    const routes = [
        { name: 'home', href: `/${locale}/` },
        { name: 'patients', href: `/${locale}/patients` },
        { name: 'practitioners', href: `/${locale}/practitioners` },
    ];

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
                    <NavBar routes={routes} locale={locale} />
                    {children}
                </NextIntlClientProvider >
            </body>
        </html>
    )
}
