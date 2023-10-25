'use client'
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import styles from './login.module.css';
import { useTranslations } from "next-intl";
import { z } from 'zod';
import { add, getByEmailAndPassword, getById, update } from '@/services/userService';
import { useRouter } from 'next/navigation';
import { SettingsButton } from '@/components/misc';
import { PractitionerAddModal } from '@/modals/practitionerModals';
import { Practitioner } from '@/constants/practitionerConstants';
import { CustomModal } from '@/modals/misc';
import { MdArrowBack } from 'react-icons/md';
import { toast } from 'react-toastify';
import { setCookie } from 'typescript-cookie';


type ModalType = 'practSelect' | 'practAdd' | 'registration' | null;
type FormData = { email: string, password: string, confirmPassword: string };

export default function Login() {
    const t = useTranslations();
    const { replace } = useRouter();

    const login = useCallback((email: string, password: string) => {
        getByEmailAndPassword('practitioners', email, password).then(body => {
            if (body.data) {
                setCookie('loggedInUser', body.data._id, { sameSite: 'strict', path: '/' });
                replace('main');
            } else {
                console.log(body.error);
                toast(t('Error.loginError'), { type: 'error' });
            }
        }).catch(err => console.error(err));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <>
            <Header />
            <Form mode='login' submit={(email: string, password: string) => login(email, password)} />
        </>
    )
}

function Header() {
    const t = useTranslations();
    const [showModal, setShowModal] = useState<ModalType>(null);
    const previousModal = useRef<ModalType>(null);
    const practitioner = useRef(new Practitioner());
    const regAction = previousModal.current === 'practAdd' ? add : update;

    const modalSetter = useCallback((nextModal: ModalType) => {
        if (showModal === 'registration' && nextModal === 'practSelect') {
            practitioner.current = new Practitioner();
        }
        previousModal.current = showModal;
        setShowModal(nextModal);
    }, [showModal]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={styles['login-header']}>
            <SettingsButton />
            <button className={styles['registration-button']} onClick={() => {
                practitioner.current = new Practitioner();
                modalSetter('practSelect');
            }}>
                {t('Login.registration').toUpperCase()}
            </button>

            {showModal === 'practSelect' && <PractitionerSelectModal practitioner={practitioner} modalSetter={modalSetter} />}

            {showModal === 'practAdd' &&
                <PractitionerAddModal data={practitioner.current} titleText={t('Practitioner.add')} saveButtonText={t('Misc.next')}
                    hide={() => modalSetter('practSelect')} onSave={(item: Practitioner) => {
                        practitioner.current = item;
                        modalSetter('registration');
                    }} />
            }

            {showModal === 'registration' &&
                <RegistrationModal practitioner={practitioner.current} hide={() => modalSetter(previousModal.current)} dbAction={regAction} />
            }
        </div>
    )
}

function PractitionerSelectModal({ practitioner, modalSetter }: { practitioner: MutableRefObject<Practitioner>, modalSetter: (modalType: ModalType) => any }) {
    const t = useTranslations();
    const [id, setId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const select = useCallback((id: string) => {
        getById('practitioners', id).then(body => {
            if (body.data) {
                if (body.data.login) {
                    setErrorMessage(t('Error.userHasLogin'));
                } else {
                    practitioner.current = body.data;
                    modalSetter('registration');
                }
            } else {
                setErrorMessage(t('Error.userNotFound'));
            }
        }).catch(err => {
            setErrorMessage(t('Error.userNotFound'));
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <CustomModal width='260px' onCancel={() => modalSetter(null)} >
            <h3>{t('Practitioner.select')}</h3>
            <form className={styles['registration-container']} onSubmit={(e) => {
                e.preventDefault();
                select(id);
            }}>
                <label>ID:
                    <input value={id} onChange={(e) => { setId(e.target.value) }} />
                </label>
                <label className='error'>{errorMessage}</label>
                <button type='submit' disabled={id.length === 0}>{t('Misc.next')}</button>
                <h5 style={{ margin: '10px' }}>vagy</h5>
                <button type='button' style={{ borderColor: 'var(--green)' }} onClick={() => modalSetter('practAdd')}>
                    {t('Practitioner.addNew')}
                </button>
            </form>
        </CustomModal>
    )
}

function RegistrationModal({ practitioner, hide, dbAction }:
    { practitioner: Practitioner, hide: any, dbAction: (collection: string, data: Practitioner) => Promise<any> }) {
    const t = useTranslations();
    const { replace } = useRouter();

    const register = useCallback((email: string, password: string) => {
        dbAction('practitioners', { ...practitioner, login: { email, password } })
            .then(res => {
                toast(t('Toast.registrationSuccess'), { type: 'success' });
                setCookie('loggedInUser', res.data._id, { sameSite: 'strict', path: '/' });
                replace('main');
            })
            .catch(err => {
                toast(t('Toast.registrationError'), { type: 'error' });
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <CustomModal width='350px' onCancel={hide} >
            <div className={styles['registration-header']}>
                <MdArrowBack size='25px' onClick={hide} />
                <label>{practitioner.name}</label>
            </div>

            <Form mode='registration' submit={(email: string, password: string) => register(email, password)} />
        </CustomModal>
    )
}

function Form({ mode, submit }: { mode: 'login' | 'registration', submit: any }) {
    const t = useTranslations();
    const [data, setData] = useState<FormData>({ email: '', password: '', confirmPassword: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const className = mode === 'registration' ? styles['registration-container'] : styles['login-container'];
    const saveButtonText = mode === 'registration' ? t('Login.register') : t('Login.login');

    const setter = useCallback((target: HTMLInputElement) => {
        setErrorMessage('');
        setData(prev => ({ ...prev, [target.name]: target.value }));
    }, []);

    const onSubmit = useCallback((data: FormData) => {
        try {
            schema.parse(data);

            if (mode === 'login' || data.password === data.confirmPassword) {
                submit(data.email, data.password);
            } else {
                setErrorMessage(t('Error.passwordMismatch'));
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                setErrorMessage(t('Error.' + err.issues[0].message));
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <form className={className} onSubmit={e => {
            e.preventDefault();
            onSubmit(data);
        }}>
            <label>E-mail:
                <input name='email' value={data.email} onChange={(e) => { setter(e.target) }} />
            </label>
            <label>{t('User.password')}:
                <input type='password' name='password' value={data.password} onChange={(e) => { setter(e.target) }} />
            </label>
            {mode === 'registration' &&
                <label>{t('User.confirmPassword')}:
                    <input type='password' name='confirmPassword' value={data.confirmPassword} onChange={(e) => { setter(e.target) }} />
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
