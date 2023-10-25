'use client'
import { NavBar } from '@/components/navbar/navbar'
import { Practitioner } from '@/constants/practitionerConstants';
import { getById } from '@/services/userService';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';
import { getCookie, removeCookie } from 'typescript-cookie';

export const UserContext = createContext<Practitioner | null>(null);

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations();
    const { replace } = useRouter();
    const [user, setUser] = useState<Practitioner | null>(null);

    // name must be a string that is a key in the translate.tsx file
    const routes = [
        { name: 'patients', href: 'patients' }
    ];
    const adminRoutes = [
        { name: 'patients', href: 'patients' },
        { name: 'practitioners', href: 'practitioners' }
    ];

    useEffect(() => {
        getById('practitioners', getCookie('loggedInUser')!).then(res => {
            if (res.data) {
                setUser(res.data);
            } else {
                removeCookie('loggedInUser', { sameSite: 'strict', path: '/' });
                replace('/login');
            }
        }).catch(err => console.error(err));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!user) return <h3>{t('Misc.loading')}</h3>;

    return (
        <>
            <UserContext.Provider value={user}>
                <NavBar routes={user.admin ? adminRoutes : routes} />
                {children}
            </UserContext.Provider>
        </>
    )
}
