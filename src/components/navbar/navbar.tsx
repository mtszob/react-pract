'use client'
import styles from './navbar.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next-intl/client';
import { MdLogout } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { SettingsButton } from '../misc';
import { useContext } from 'react';
import { UserContext } from '@/app/[locale]/main/layout';
import { useSWRConfig } from 'swr';


export function NavBar({ routes }: { routes: { name: string, href: string }[] }) {
    const t = useTranslations('Nav');
    const { replace } = useRouter();
    const { mutate } = useSWRConfig()
    const pathname = usePathname();
    const pathnameArray = pathname.split('/');
    const top = pathnameArray[pathnameArray.length - 1];
    const loggedInUser = useContext(UserContext);

    return (
        <>
            <div className={styles['header']}>
                <MdLogout onClick={() => {
                    localStorage.removeItem('loggedInUser');
                    replace('/login');
                    mutate(key => true, undefined, { revalidate: false }); // clear swr cache
                }} size='25px' />
                <SettingsButton />
                {loggedInUser?.name}
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
