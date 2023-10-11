import { Practitioner, practitionerSchema } from '@/constants/practitionerConstants';
import styles from './modals.module.css';
import { CustomModal, Select } from '@/components/misc/serverComponents';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { z } from 'zod';


export function PractitionerDetailsModal({ data, hide }: { data: Practitioner, hide: any }) {
    const t = useTranslations();

    return (
        <CustomModal onCancel={hide}>
            <div className={styles['user-details']}>
                <h3>{data.name}</h3>
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

export function PractitionerAddModal({ data, hide, onSave }: { data?: Practitioner | null, hide: any, onSave: any }) {
    const t = useTranslations();
    const [practitioner, setPractitioner] = useState(data ? data : new Practitioner());
    let showErrorMessage = false;
    let errorMessage = '';

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
        <CustomModal onCancel={hide}>
            <h3>{data ? t('Practitioner.update') : t('Practitioner.add')}</h3>
            <form className={styles['user-add-form']} onSubmit={async (e) => {
                e.preventDefault();
                const practCopy = { ...practitioner };
                practCopy.name = `${practitioner.nameObj.prefix} ${practitioner.nameObj.last} ${practitioner.nameObj.first} ${practitioner.nameObj.suffix}`.trim();
                await onSave(practCopy);
                hide();
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
                <label>{t('Practitioner.role')}*:
                    <Select tabIndex={7} selected={practitioner.admin === null ? '-' : (practitioner.admin ? t('Practitioner.admin') : t('Practitioner.user'))}
                        options={['-', t('Practitioner.user'), t('Practitioner.admin')]}
                        setter={(str) => setPractitioner({ ...practitioner, admin: str === '-' ? null : str === t('Practitioner.admin') })}
                    />
                </label>
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
                <button disabled={showErrorMessage} tabIndex={13} type='submit'>{t('Practitioner.save')}</button>
            </form>
        </CustomModal>
    )
}
