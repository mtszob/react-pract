'use client'
import { NavBar } from '@/components/navbar/navbar'
import { useAuthCheck } from '@/constants/misc';
import { Practitioner } from '@/constants/practitionerConstants';
import { useTranslations } from 'next-intl';
import { createContext, useState } from 'react';

export const UserContext = createContext<Practitioner | null>(null);

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations();
    const [user, setUser] = useState<Practitioner | null>(null);
    // name must be a string that is a key in the translate.tsx file
    const routes = [{ name: 'patients', href: 'patients' }];
    const adminRoutes = [{ name: 'patients', href: 'patients' }, { name: 'practitioners', href: 'practitioners' }]

    // ha nincs bejelentkezve (false) akkor irányítsuk át ('/login')
    useAuthCheck(false, setUser);

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
