'use client'
import { NavBar } from '@/components/navbar/navbar'
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';


export default function MainLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations();
    const { replace } = useRouter();
    const [render, setRender] = useState(false);

    // name must be a string that is a key in the translate.tsx file
    const routes = [
        { name: 'patients', href: 'patients' },
        { name: 'practitioners', href: 'practitioners' },
    ];

    // auth check (nem a legjobb)
    useLayoutEffect(() => {
        if (!localStorage.getItem('loggedInUser')) {
            replace('/login');
        } else {
            setRender(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    if (!render) return <h3>{t('Misc.loading')}</h3>;

    return (
        <>
            <NavBar routes={routes} />
            {children}
        </>
    )
}
