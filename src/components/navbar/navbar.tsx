'use client'
import styles from './navbar.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next-intl/client';
import { MdLogout } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { SettingsButton } from '../misc';
import { useCallback, useContext, useState } from 'react';
import { UserContext } from '@/app/[locale]/main/layout';
import { useSWRConfig } from 'swr';
import { CustomModal } from '@/modals/misc';
import { Practitioner } from '@/constants/practitionerConstants';
import { z } from 'zod';
import { update } from '@/services/userService';
import { toast } from 'react-toastify';


export function NavBar({ routes }: { routes: { name: string, href: string }[] }) {
    const t = useTranslations('Nav');
    const { replace } = useRouter();
    const { mutate } = useSWRConfig()
    const pathname = usePathname();
    const pathnameArray = pathname.split('/');
    const top = pathnameArray[pathnameArray.length - 1];
    const loggedInUser = useContext(UserContext);
    const [userState, setUserState] = useState(loggedInUser);
    const [showLoginInfo, setShowLoginInfo] = useState(false);

    return (
        <>
            <div className={styles['header']}>
                <MdLogout onClick={() => {
                    localStorage.removeItem('loggedInUser');
                    replace('/login');
                    mutate(key => true, undefined, { revalidate: false }); // clear swr cache
                }} size='25px' />
                <SettingsButton />
                <label onClick={() => setShowLoginInfo(true)}>{userState?.name}</label>
                {showLoginInfo && <LoginInfoModal user={userState!} setUser={setUserState} onCancel={() => setShowLoginInfo(false)} />}
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

function LoginInfoModal({ user, setUser, onCancel }: { user: Practitioner, setUser: (user: Practitioner) => void, onCancel: any }) {
    const t = useTranslations();
    const [email, setEmail] = useState(user.login!.email);
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState({ changed: '', confirm: '' });
    const [passwordError, setPasswordError] = useState('');

    const updateEmail = useCallback((user: Practitioner, email: string) => {
        try {
            z.string().email().parse(email);
            const updatedUser = { ...user, login: { ...user.login!, email: email } };
            update('practitioners', updatedUser).then(res => {
                setUser(updatedUser);
                toast(t('Toast.emailUpdateSuccess'), { type: 'success' });
            }).catch(err => {
                console.error('error when updating login data', err);
                toast(t('Toast.emailUpdateError'), { type: 'error' });
            });
        } catch (err) {
            setEmailError(t('Error.invalidEmail'));
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    const updatePassword = useCallback((user: Practitioner, password: { changed: string, confirm: string }) => {
        if (password.changed.length < 6) {
            setPasswordError(t('Error.invalidPassword'));
        } else if (password.changed !== password.confirm) {
            setPasswordError(t('Error.passwordMismatch'));
        } else {
            const updatedUser = { ...user, login: { ...user.login!, password: password.changed } };
            update('practitioners', updatedUser).then(res => {
                setUser(updatedUser);
                toast(t('Toast.passwordUpdateSuccess'), { type: 'success' });
            }).catch(err => {
                console.error('error when updating login data', err);
                toast(t('Toast.passwordUpdateError'), { type: 'error' });
            });
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <CustomModal width='350px' onCancel={onCancel}>
            <h3>{t('User.loginData')}</h3>
            <form className={styles['email-form']} onSubmit={(e) => {
                e.preventDefault();
                updateEmail(user, email);
            }}>
                <label>{t('User.newEmail')}:
                </label>
                <input style={{ flex: 1 }} value={email} onChange={(e) => {
                    setEmailError('');
                    setEmail(e.target.value);
                }} />
                <button type='submit'>{t('Misc.save')}</button>
            </form>
            <label className='error'>{emailError}</label>
            <hr />
            <h4>{t('User.changePassword')}</h4>
            <form className={styles['password-form']} onSubmit={(e) => {
                e.preventDefault();
                updatePassword(user, password);
            }}>
                <label>{t('User.newPassword')}:
                    <input type='password' value={password.changed} onChange={(e) => {
                        setPasswordError('');
                        setPassword({ ...password, changed: e.target.value });
                    }} />
                </label>
                <label>{t('User.confirmPassword')}:
                    <input type='password' value={password.confirm} onChange={(e) => {
                        setPasswordError('');
                        setPassword({ ...password, confirm: e.target.value });
                    }} />
                </label>
                <label className='error'>{passwordError}</label>
                <button type='submit'>{t('Misc.save')}</button>
            </form>
        </CustomModal>
    )
}