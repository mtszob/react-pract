'use client'
import styles from './navbar.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next-intl/client';
import { MdLogout } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { SettingsButton } from '../misc';
import { useContext, useState } from 'react';
import { UserContext } from '@/app/[locale]/main/layout';
import { useSWRConfig } from 'swr';
import { removeCookie } from 'typescript-cookie';
import { UserEditModal } from '@/modals/practitionerModals';


export function NavBar({ routes }: { routes: { name: string, href: string }[] }) {
    const t = useTranslations('Nav');
    const { replace } = useRouter();
    const { mutate } = useSWRConfig()
    const pathname = usePathname();
    const pathnameArray = pathname.split('/');
    const top = pathnameArray[pathnameArray.length - 1];
    const loggedInUser = useContext(UserContext);
    const [userState, setUserState] = useState(loggedInUser);
    const [showUserEdit, setShowUserEdit] = useState(false);

    return (
        <>
            <div className={styles['nav-header']}>
                <MdLogout onClick={() => {
                    removeCookie('loggedInUser', { sameSite: 'strict', path: '/' });
                    replace('/login');
                    mutate(key => true, undefined, { revalidate: false }); // clear swr cache
                }} size='25px' />
                <SettingsButton />
                <label onClick={() => setShowUserEdit(true)}>{userState?.name}</label>
                {showUserEdit && <UserEditModal user={userState!} setUser={setUserState} onCancel={() => setShowUserEdit(false)} />}
            </div>
            <div className={styles['nav-bar']}>
                {routes.map((route, index) => {
                    return (
                        <Link key={index} className={`${styles['nav-button']} ${top === route.href && styles['selected-nav-button']}`} href={route.href}>
                            {t(route.name)}
                        </Link>
                    )
                })}
            </div>
        </>
    )
}