'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next-intl/client';
import { AiFillSetting } from 'react-icons/ai';
import { CustomModal, Select } from './serverComponents';
import { useState } from 'react';
import { useTranslations } from 'next-intl';


export function NavBar({ routes, locale }: { routes: { name: string, href: string }[], locale: string }) {
    const t = useTranslations('Nav');
    const [showSettings, setShowSettings] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className='nav-bar'>
            {routes.map((route, index) => {
                return (
                    <Link key={index} className={'nav-button' + (`/${locale}${pathname}` === route.href ? ' selected-nav-button' : '')} href={route.href}>
                        {t(route.name)}
                    </Link>
                )
            })}
            <AiFillSetting onClick={() => setShowSettings(true)} size='25px' />
            {showSettings &&
                <CustomModal width='175px' onCancel={() => setShowSettings(false)}>
                    <h3>{t('settings')}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <label>
                            {t('language')}:
                        </label>
                        <Select selected={locale} options={['en', 'hu']} setter={(str: string) => {
                            router.replace(pathname, { locale: str });
                        }} />
                    </div>
                </CustomModal>
            }
        </div>
    )
}
