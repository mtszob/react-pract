import styles from './modals.module.css';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getById, getByName } from '@/services/practitionerService';
import { DebounceInput } from 'react-debounce-input';
import { z } from 'zod';
import { Patient, patientSchema } from '@/constants/patientConstants';
import { CustomModal, SSNInput, Select } from '@/components/misc/serverComponents';


export function PatientDetailsModal({ data, hide }: { data: Patient, hide: any }) {
    const t = useTranslations();
    const [practitionerName, setPractitionerName] = useState('-');

    useEffect(() => {
        if (data?.practitioner) {
            getById(data.practitioner).then(body => setPractitionerName(body.data.name)).catch(err => console.error(err));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <CustomModal onCancel={hide}>
            <div className={styles['user-details']}>
                <h3>{data.name}</h3>
                <label><b>{t('User.prefix')}:</b> {data.nameObj.prefix || '-'}</label>
                <label><b>{t('User.lastName')}:</b> {data.nameObj.last}</label>
                <label><b>{t('User.firstName')}:</b> {data.nameObj.first}</label>
                <label><b>{t('User.suffix')}:</b> {data.nameObj.suffix || '-'}</label>
                <label><b>{t('Patient.identifier')}:</b> {data.identifier}</label>
                <label><b>{t('User.dateOfBirth')}:</b> {data.dob}</label>
                <label><b>{t('User.sex')}:</b> {data.isMale ? t('User.male') : t('User.female')}</label>
                <label><b>{t('User.email')}:</b> {data.telecom.email}</label>
                <label><b>{t('User.phone')}:</b> {data.telecom.phone}</label>
                <label><b>{t('User.postalCode')}:</b> {data.address.postalCode}</label>
                <label><b>{t('User.city')}:</b> {data.address.city}</label>
                <label><b>{t('User.line')}:</b> {data.address.line}</label>
                <label><b>{t('Patient.practitioner')}:</b> {practitionerName}</label>
            </div>
        </CustomModal>
    )
}

export function PatientAddModal({ data, hide, onSave }: { data?: Patient, hide: any, onSave: any }) {
    const t = useTranslations();
    const [patient, setPatient] = useState(data ? data : new Patient());
    const [practitionerName, setPractitionerName] = useState('');
    const [practNotFound, setPractNotFound] = useState(false);
    let showErrorMessage = false;
    let errorMessage = '';

    useEffect(() => {
        if (data?.practitioner) {
            getById(data.practitioner).then(body => setPractitionerName(body.data.name)).catch(err => console.error(err));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    try {
        patientSchema.parse(patient);
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
            <h3>{data ? t('Patient.update') : t('Patient.add')}</h3>
            <form className={styles['user-add-form']} onSubmit={async (e) => {
                e.preventDefault();
                const patCopy = { ...patient };
                patCopy.name = `${patient.nameObj.prefix} ${patient.nameObj.last} ${patient.nameObj.first} ${patient.nameObj.suffix}`.trim();
                await onSave(patCopy);
                hide();
            }}>
                <div>
                    <label>{t('User.name')}*:</label>
                    <div className={styles['input-container']}>
                        <input tabIndex={1} value={patient.nameObj.prefix} autoFocus={true} placeholder={t('User.prefix')}
                            onChange={(e) => setPatient({ ...patient, nameObj: { ...patient.nameObj, prefix: e.target.value } })}
                        />
                        <input tabIndex={2} value={patient.nameObj.last} placeholder={t('User.lastName') + '*'}
                            onChange={(e) => setPatient({ ...patient, nameObj: { ...patient.nameObj, last: e.target.value } })}
                        />
                        <input tabIndex={3} value={patient.nameObj.first} placeholder={t('User.firstName') + '*'}
                            onChange={(e) => setPatient({ ...patient, nameObj: { ...patient.nameObj, first: e.target.value } })}
                        />
                        <input tabIndex={4} value={patient.nameObj.suffix} placeholder={t('User.suffix')}
                            onChange={(e) => setPatient({ ...patient, nameObj: { ...patient.nameObj, suffix: e.target.value } })}
                        />
                    </div>
                </div>
                <label>{t('Patient.identifier')}*:
                    <div className={styles['input-container']}>
                        <SSNInput tabIndex={5} ssn={patient.identifier} setter={(str: string) => setPatient({ ...patient, identifier: str })} />
                    </div>
                </label>
                <label>{t('User.dateOfBirth')}*:
                    <div className={styles['input-container']}>
                        <input type='date' tabIndex={6} value={patient.dob} onChange={(e) => setPatient({ ...patient, dob: e.target.value })} />
                    </div>
                </label>
                <label>{t('User.sex')}*:
                    <Select tabIndex={7} selected={patient.isMale === null ? '-' : (patient.isMale ? t('User.male') : t('User.female'))}
                        options={['-', t('User.female'), t('User.male')]}
                        setter={(str) => { setPatient({ ...patient, isMale: str === '-' ? null : str === t('User.male') }); }}
                    />
                </label>
                <label>{t('User.email')}*:
                    <div className={styles['input-container']}>
                        <input tabIndex={8} value={patient.telecom.email}
                            onChange={(e) => setPatient({ ...patient, telecom: { ...patient.telecom, email: e.target.value } })}
                        />
                    </div>
                </label>
                <label>{t('User.phone')}*:
                    <div className={styles['input-container']}>
                        <input tabIndex={9} value={patient.telecom.phone} maxLength={12}
                            onChange={(e) => setPatient({ ...patient, telecom: { ...patient.telecom, phone: e.target.value } })}
                        />
                    </div>
                </label>
                <label>{t('User.address')}*:
                    <div className={styles['input-container']}>
                        <input tabIndex={10} value={patient.address.postalCode} maxLength={4} placeholder={t('User.postalCode') + '*'}
                            onChange={(e) => setPatient({ ...patient, address: { ...patient.address, postalCode: e.target.value } })}
                        />
                        <input tabIndex={11} value={patient.address.city} placeholder={t('User.city') + '*'}
                            onChange={(e) => setPatient({ ...patient, address: { ...patient.address, city: e.target.value } })}
                        />
                        <input tabIndex={12} value={patient.address.line} placeholder={t('User.line') + '*'}
                            onChange={(e) => setPatient({ ...patient, address: { ...patient.address, line: e.target.value } })}
                        />
                    </div>
                </label>
                <label>{t('Patient.practitioner')}:
                    <div className={styles['input-container']}>
                        <DebounceInput tabIndex={13} value={practitionerName} debounceTimeout={750} onChange={(e) => {
                            setPractitionerName(e.target.value);

                            if (e.target.value === '') {
                                setPractNotFound(false);
                                setPatient({ ...patient, practitioner: null });
                            } else {
                                getByName(e.target.value).then(body => {
                                    if (body.data) {
                                        setPractNotFound(false);
                                        setPatient({ ...patient, practitioner: body.data._id });
                                    } else {
                                        setPractNotFound(true);
                                    }
                                }).catch(err => console.error(err));
                            }
                        }}
                        />
                    </div>
                </label>
                {practNotFound && <div className='error'>{`${t('Patient.practNotFound')}: "${practitionerName}"`}</div>}
                <div className='error'>{errorMessage}</div>
                <button disabled={showErrorMessage || practNotFound} tabIndex={14} type='submit'>{t('Patient.save')}</button>
            </form>
        </CustomModal>
    )
}
