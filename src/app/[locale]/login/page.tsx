'use client'
import { useLayoutEffect, useRef, useState } from 'react';
import styles from './login.module.css';
import { useTranslations } from "next-intl";
import { z } from 'zod';
import { add, getByEmailAndPassword } from '@/services/userService';
import { useRouter } from 'next/navigation';
import { SettingsButton } from '@/components/misc';
import { PractitionerAddModal } from '@/modals/practitionerModals';
import { Practitioner } from '@/constants/practitionerConstants';
import { CustomModal } from '@/modals/misc';
import { MdArrowBack } from 'react-icons/md';


export default function Login() {
    const t = useTranslations();
    const { replace } = useRouter();
    const [render, setRender] = useState(false);
    const [showPractAdd, setShowPractAdd] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const practitioner = useRef(new Practitioner());

    // auth check (nem a legjobb)
    useLayoutEffect(() => {
        if (localStorage.getItem('loggedInUser')) {
            replace('main');
        } else {
            setRender(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    if (!render) return <h3>{t('Misc.loading')}</h3>;

    return (
        <>
            <LoginForm mode='login' t={t} submit={(email: string, password: string) => {
                getByEmailAndPassword('practitioners', email, password).then(body => {
                    if (body?.data) {
                        localStorage.setItem('loggedInUser', body.data._id);
                        replace('main');
                    } else {
                        alert(t('Error.userNotFound'));
                    }
                }).catch(err => console.error(err));
            }} />

            <div className={styles['login-header']}>
                <SettingsButton />
                <button className={styles['registration-button']} onClick={() => { practitioner.current = new Practitioner(); setShowPractAdd(true) }}>
                    {t('Login.registration').toUpperCase()}
                </button>

                {showPractAdd &&
                    <PractitionerAddModal data={practitioner.current} titleText={t('Practitioner.data')} saveButtonText={t('Misc.next')}
                        hide={() => setShowPractAdd(false)} onSave={(item: Practitioner) => {
                            practitioner.current = item;
                            setShowPractAdd(false);
                            setShowRegister(true);
                        }} />
                }

                {showRegister &&
                    <CustomModal width='350px' onCancel={() => { setShowRegister(false); setShowPractAdd(true); }} >
                        <div className={styles['registration-header']}>
                            <MdArrowBack size='25px' onClick={() => { setShowRegister(false); setShowPractAdd(true); }} />
                            <label>{practitioner.current.name}</label>
                        </div>
                        <LoginForm mode='registration' t={t} submit={(email: string, password: string) => {
                            add('practitioners', { ...practitioner.current, login: { email, password } })
                                .then(res => {
                                    localStorage.setItem('loggedInUser', res.savedData._id);
                                    replace('main');
                                })
                                .catch(err => {
                                    alert(`${t('Error.registration')}: "${err}"`);
                                });
                        }} />
                    </CustomModal>
                }
            </div>
        </>
    )
}

function LoginForm({ mode, t, submit }: { mode: 'login' | 'registration', t: any, submit: any }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const className = mode === 'registration' ? styles['registration-container'] : styles['login-container'];
    const saveButtonText = mode === 'registration' ? t('Login.register') : t('Login.login');

    return (
        <form className={className} onSubmit={async (e) => {
            e.preventDefault();

            try {
                schema.parse({ email, password });

                if (mode === 'login' || password === confirmPassword) {
                    submit(email, password);
                } else {
                    setErrorMessage(t('Error.passwordMismatch'));
                }
            } catch (err) {
                if (err instanceof z.ZodError) {
                    setErrorMessage(t('Error.' + err.issues[0].message));
                }
            }
        }}>
            <label>E-mail:
                <input value={email} onChange={(e) => {
                    setErrorMessage('');
                    setEmail(e.target.value);
                }} />
            </label>
            <label>{t('User.password')}:
                <input type='password' value={password} onChange={(e) => {
                    setErrorMessage('');
                    setPassword(e.target.value);
                }} />
            </label>
            {mode === 'registration' &&
                <label>{t('User.confirmPassword')}:
                    <input type='password' value={confirmPassword} onChange={(e) => {
                        setErrorMessage('');
                        setConfirmPassword(e.target.value);
                    }} />
                </label>
            }
            <label className='error'>{errorMessage}</label>
            <button type='submit'>{saveButtonText}</button>
        </form>
    )
}

const schema = z.object({
    email: z.string().email({ message: 'invalidEmail' }),
    password: z.string().min(6, { message: 'invalidPassword' })
});
