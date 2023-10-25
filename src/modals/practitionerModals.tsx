import { Practitioner, practitionerSchema } from '@/constants/practitionerConstants';
import styles from './modals.module.css';
import { DefaultHeader, Select } from '@/components/misc';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { CustomModal } from './misc';
import { update } from '@/services/userService';
import { toast } from 'react-toastify';


export function PractitionerDetailsModal({ data, hide }: { data: Practitioner, hide: any }) {
    const t = useTranslations();

    return (
        <CustomModal width='650px' onCancel={hide}>
            <div className={styles['user-details']}>
                <DefaultHeader label={data.name} backButtonClick={hide} />
                <label><b>{t('User.prefix')}:</b> {data.nameObj.prefix || '-'}</label>
                <label><b>{t('User.lastName')}:</b> {data.nameObj.last}</label>
                <label><b>{t('User.firstName')}:</b> {data.nameObj.first}</label>
                <label><b>{t('User.suffix')}:</b> {data.nameObj.suffix || '-'}</label>
                <label><b>{t('User.dateOfBirth')}:</b> {data.dob}</label>
                <label><b>{t('User.sex')}:</b> {data.isMale ? t('User.male') : t('User.female')}</label>
                <label><b>{t('Practitioner.role')}:</b> {data.admin ? t('Practitioner.admin') : t('Practitioner.user')}</label>
                <label><b>{t('User.email')}:</b> {data.telecom.email}</label>
                <label><b>{t('User.phone')}:</b> {data.telecom.phone}</label>
                <label><b>{t('User.postalCode')}:</b> {data.address.postalCode}</label>
                <label><b>{t('User.city')}:</b> {data.address.city}</label>
                <label><b>{t('User.line')}:</b> {data.address.line}</label>
            </div>
        </CustomModal>
    )
}

export function PractitionerFormModal({ data, title, submitText, hide, onSave }:
    { data?: Practitioner | null, title?: string, submitText?: string, hide: any, onSave: any }) {
    const t = useTranslations();

    return (
        <CustomModal width='650px' onCancel={hide}>
            <DefaultHeader label={title || (data ? t('Practitioner.update') : t('Practitioner.add'))} backButtonClick={hide} />
            <PractitionerForm data={data} submitText={submitText} onSave={onSave} />
        </CustomModal>
    )
}

export function UserEditModal({ user, setUser, onCancel }: { user: Practitioner, setUser: (user: Practitioner) => void, onCancel: any }) {
    const t = useTranslations();

    return (
        <CustomModal width='650px' onCancel={onCancel}>
            <DefaultHeader label={t('User.updateProfile')} backButtonClick={onCancel} />
            <h4>{t('User.loginData')}</h4>
            <LoginInfoForm user={user} setUser={setUser} />
            <hr />

            <h4>{t('User.details')}</h4>
            <PractitionerForm data={user} submitText={t('Misc.saveDetails')} hideRoleOption={true} onSave={(updatedUser: any) => {
                update('practitioners', updatedUser).then(res => {
                    setUser(updatedUser);
                    toast(t('Toast.updateSuccess'), { type: 'success' });
                }).catch(err => {
                    console.error('error when updating user', err);
                    toast(t('Toast.updateError'), { type: 'error' });
                });
            }} />
        </CustomModal>
    )
}

function LoginInfoForm({ user, setUser }: { user: Practitioner, setUser: (user: Practitioner) => void, }) {
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
        <div className={styles['grid']}>
            <form onSubmit={(e) => {
                e.preventDefault();
                updateEmail(user, email);
            }}>
                <label>{t('User.newEmail')}:
                    <div className={styles['input-container']}>
                        <input value={email} onChange={(e) => {
                            setEmailError('');
                            setEmail(e.target.value);
                        }} />
                        <button type='submit'>{t('Misc.saveEmail')}</button>
                    </div>
                </label>
            </form>
            {emailError && <label className='error'>{emailError}</label>}
            <form onSubmit={(e) => {
                e.preventDefault();
                updatePassword(user, password);
            }}>
                <label>{t('User.newPassword')}:
                    <div className={styles['input-container']}>
                        <input type='password' value={password.changed} onChange={(e) => {
                            setPasswordError('');
                            setPassword({ ...password, changed: e.target.value });
                        }} />
                        <input type='password' value={password.confirm} onChange={(e) => {
                            setPasswordError('');
                            setPassword({ ...password, confirm: e.target.value });
                        }} />
                        <button type='submit'>{t('Misc.savePassword')}</button>
                    </div>
                </label>
            </form>
            {passwordError && <label className='error'>{passwordError}</label>}
        </div>
    )
}

function PractitionerForm({ data, submitText, hideRoleOption, onSave }: { data?: Practitioner | null, submitText?: string, hideRoleOption?: boolean, onSave: any }) {
    const t = useTranslations();
    const [practitioner, setPractitioner] = useState(new Practitioner());
    let showErrorMessage = false;
    let errorMessage = '';

    // ez profil frissítésnél fontos, amikor a bejelentkezési emailt elmentjük, akkor frissüljön a user a részleteknél is
    useEffect(() => {
        if (data) { setPractitioner(data); }
    }, [data])

    try {
        practitionerSchema.parse(practitioner);
        showErrorMessage = false;
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            const issues = err.issues.filter(issue => !(['too_small', 'invalid_type'].includes(issue.code)));
            errorMessage = 0 < issues.length ? t('Error.' + issues[0].message) : '';
        }
        showErrorMessage = true;
    }

    return (
        <form className={styles['grid']} onSubmit={async (e) => {
            e.preventDefault();
            const practCopy = { ...practitioner };
            practCopy.name = `${practitioner.nameObj.prefix} ${practitioner.nameObj.last} ${practitioner.nameObj.first} ${practitioner.nameObj.suffix}`.trim();
            onSave(practCopy);
        }}>
            <label>{t('User.name')}*:
                <div className={styles['input-container']}>
                    <input tabIndex={1} value={practitioner.nameObj.prefix} autoFocus={true} placeholder={t('User.prefix')}
                        onChange={(e) => setPractitioner({ ...practitioner, nameObj: { ...practitioner.nameObj, prefix: e.target.value } })}
                    />
                    <input tabIndex={2} value={practitioner.nameObj.last} placeholder={t('User.lastName') + '*'}
                        onChange={(e) => setPractitioner({ ...practitioner, nameObj: { ...practitioner.nameObj, last: e.target.value } })}
                    />
                    <input tabIndex={3} value={practitioner.nameObj.first} placeholder={t('User.firstName') + '*'}
                        onChange={(e) => setPractitioner({ ...practitioner, nameObj: { ...practitioner.nameObj, first: e.target.value } })}
                    />
                    <input tabIndex={4} value={practitioner.nameObj.suffix} placeholder={t('User.suffix')}
                        onChange={(e) => setPractitioner({ ...practitioner, nameObj: { ...practitioner.nameObj, suffix: e.target.value } })}
                    />
                </div>
            </label>
            <label>{t('User.dateOfBirth')}*:
                <div className={styles['input-container']}>
                    <input type='date' tabIndex={5} value={practitioner.dob}
                        onChange={(e) => setPractitioner({ ...practitioner, dob: e.target.value })}
                    />
                </div>
            </label>
            <label>{t('User.sex')}*:
                <Select tabIndex={6} selected={practitioner.isMale === null ? '-' : (practitioner.isMale ? t('User.male') : t('User.female'))}
                    options={['-', t('User.female'), t('User.male')]}
                    setter={(str) => setPractitioner({ ...practitioner, isMale: str === '-' ? null : str === t('User.male') })}
                />
            </label>
            {!hideRoleOption &&
                <label>{t('Practitioner.role')}*:
                    <Select tabIndex={7} selected={practitioner.admin === null ? '-' : (practitioner.admin ? t('Practitioner.admin') : t('Practitioner.user'))}
                        options={['-', t('Practitioner.user'), t('Practitioner.admin')]}
                        setter={(str) => setPractitioner({ ...practitioner, admin: str === '-' ? null : str === t('Practitioner.admin') })}
                    />
                </label>
            }
            <label>{t('User.email')}*:
                <div className={styles['input-container']}>
                    <input tabIndex={8} value={practitioner.telecom.email}
                        onChange={(e) => setPractitioner({ ...practitioner, telecom: { ...practitioner.telecom, email: e.target.value } })}
                    />
                </div>
            </label>
            <label>{t('User.phone')}*:
                <div className={styles['input-container']}>
                    <input tabIndex={9} value={practitioner.telecom.phone} maxLength={12}
                        onChange={(e) => setPractitioner({ ...practitioner, telecom: { ...practitioner.telecom, phone: e.target.value } })}
                    />
                </div>
            </label>
            <label>{t('User.address')}*:
                <div className={styles['input-container']}>
                    <input tabIndex={10} value={practitioner.address.postalCode} maxLength={4} placeholder={t('User.postalCode') + '*'}
                        onChange={(e) => setPractitioner({ ...practitioner, address: { ...practitioner.address, postalCode: e.target.value } })}
                    />
                    <input tabIndex={11} value={practitioner.address.city} placeholder={t('User.city') + '*'}
                        onChange={(e) => setPractitioner({ ...practitioner, address: { ...practitioner.address, city: e.target.value } })}
                    />
                    <input tabIndex={12} value={practitioner.address.line} placeholder={t('User.line') + '*'}
                        onChange={(e) => setPractitioner({ ...practitioner, address: { ...practitioner.address, line: e.target.value } })}
                    />
                </div>
            </label>
            <div className='error'>{errorMessage}</div>
            <button disabled={showErrorMessage} tabIndex={13} type='submit'>
                {submitText || t('Practitioner.save')}
            </button>
        </form>
    )
}
