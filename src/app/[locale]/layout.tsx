import './globals.css'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { ToastContainer, Zoom } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


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
            <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                    <ToastContainer position="bottom-center" theme="dark" transition={Zoom} autoClose={2000} hideProgressBar={true} />
                </NextIntlClientProvider >
            </body>
        </html>
    )
}
