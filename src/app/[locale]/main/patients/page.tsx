'use client'
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { ItemList } from '@/components/items/itemList';
import { PatientFormModal, PatientDetailsModal } from '@/modals/patientModals';
import { Patient } from '@/constants/patientConstants';
import { useContext, useState } from 'react';
import { getAll, getByPractitioner } from '@/services/patientService';
import { UserContext } from '../layout';
import { Practitioner } from '@/constants/practitionerConstants';
import { getDeepAttribute } from '@/services/misc';
import { add, remove, update } from '@/services/userService';
import { toast } from 'react-toastify';
import { ConfirmAlert } from '@/components/misc';

const fetcher = (pract: Practitioner) => {
    if (pract.admin) {
        return getAll().then(res => res.data);
    } else {
        return getByPractitioner(pract._id!).then(res => res.data);
    }
};

export default function Patients() {
    const t = useTranslations();
    const loggedInUser = useContext(UserContext);
    const { data, error, mutate }: any = useSWR(loggedInUser ? '/api/patients' : null, () => fetcher(loggedInUser!));

    const columns = [
        { label: t('User.name'), field: 'name' },
        { label: t('Patient.identifier'), field: 'identifier' },
        { label: t('User.dateOfBirth'), field: 'dob' },
        { label: t('User.phone'), field: 'telecom.phone' },
        { label: t('User.email'), field: 'telecom.email' },
    ];

    const colorConfig = { colors: [{ fieldValue: null, color: 'var(--green)' }], colorByField: 'practitioner' };

    const filterConfig = [
        { field: 'sex', label: t('User.sex'), options: [t('User.male'), t('User.female')] },
        { field: 'active', label: t('Patient.status'), options: [t('Patient.active'), t('Patient.inactive')] }
    ];

    const [modalData, setModalData] = useState<{ name: string, item: any }>({ name: '', item: null });
    const hideModals = () => setModalData({ name: '', item: null });

    if (error) return <h3>{t('Error.errorWhenLoading')}</h3>;
    if (!data) return <h3>{t('Misc.loading')}</h3>;

    return (
        <>
            <h3>{t('Patient.title')}</h3>
            <ItemList
                data={data} columns={columns} colorConfig={colorConfig} filterConfig={filterConfig}
                filterFunction={filterFunction} setModalData={setModalData}
            />
            {modalData.name === 'details' &&
                <PatientDetailsModal data={modalData.item!} hide={hideModals} />
            }
            {modalData.name === 'add' &&
                <PatientFormModal hide={hideModals} onSave={(item: any) => {
                    add('patients', item).then(() => {
                        mutate().then(() => {
                            hideModals();
                            toast(t(`Toast.patientsAddSuccess`), { type: 'success' });
                        });
                    }).catch(err => {
                        console.error(err);
                        toast(t(`Toast.patientsAddError`), { type: 'error' });
                    });
                }} />
            }
            {modalData.name === 'update' &&
                <PatientFormModal data={modalData!.item} hide={hideModals} onSave={(item: any) => {
                    update('patients', item).then(() => {
                        mutate().then(() => {
                            hideModals();
                            toast(t(`Toast.patientsUpdateSuccess`), { type: 'success' });
                        });
                    }).catch(err => {
                        console.error(err);
                        toast(t(`Toast.patientsUpdateError`), { type: 'error' });
                    });
                }} />
            }
            {modalData.name === 'delete' &&
                <ConfirmAlert title={t('Misc.deleteItem')} message={t('Misc.deleteConfirm', { item: modalData!.item!.name })} onCancel={hideModals}
                    onConfirm={() => {
                        remove('patients', modalData.item!).then(() => {
                            mutate().then(() => {
                                hideModals();
                                toast(t(`Toast.patientsDeleteSuccess`), { type: 'success' });
                            });
                        }).catch(err => {
                            console.error(err);
                            toast(t(`Toast.patientsDeleteError`), { type: 'error' });
                        });
                    }} />
            }
        </>
    )
}

const filterFunction = (items: Patient[], filter: any, t: any): Patient[] => {
    const searchColumns = ['name', 'identifier', 'dob', 'telecom.phone', 'telecom.email'];
    let filtered = [...items];

    if (filter.search) {
        filtered = filtered.filter(el => {
            // megnézzük hogy legalább az egyik searchColumn-ra matchel-e
            return searchColumns.reduce((accumulator, currentValue) => {
                if (accumulator) {
                    return true;
                } else {
                    return accumulator || getDeepAttribute(el, currentValue).toLowerCase().includes(filter.search.toLowerCase());
                }
            }, false);
        });
    }

    if (filter.sex !== '-') { filtered = filtered.filter(el => el.isMale === (filter.sex === t('User.male'))); }
    if (filter.active !== '-') { filtered = filtered.filter(el => (filter.active === t('Patient.active')) ? el.practitioner : !el.practitioner); }

    return filtered;
};
