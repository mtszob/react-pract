'use client'
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { ItemList } from '@/components/items/itemList';
import { PatientFormModal, PatientDetailsModal } from '@/modals/patientModals';
import { Patient } from '@/constants/patientConstants';
import { useContext } from 'react';
import { getAll, getByPractitioner } from '@/services/patientService';
import { UserContext } from '../layout';
import { Practitioner } from '@/constants/practitionerConstants';
import { getDeepAttribute } from '@/services/misc';

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

    const colsObj = {
        name: t('User.name'),
        identifier: t('Patient.identifier'),
        dob: t('User.dateOfBirth'),
        'telecom.phone': t('User.phone'),
        'telecom.email': t('User.email')
    };
    const colorData = { colors: { null: 'var(--green)' }, colorByField: 'practitioner' };
    const filterData = {
        sex: { label: t('User.sex'), options: [t('User.male'), t('User.female')] },
        active: { label: t('Patient.status'), options: [t('Patient.active'), t('Patient.inactive')] }
    };

    if (error) return <h3>{t('Error.errorWhenLoading')}</h3>;
    if (!data) return <h3>{t('Misc.loading')}</h3>;

    return (
        <>
            <h3>{t('Patient.title')}</h3>
            <ItemList
                collection='patients' data={data} mutate={mutate}
                colsObj={colsObj} colorData={colorData}
                filterData={filterData} filterFunction={filterFunction}
                DetailsModal={PatientDetailsModal} FormModal={PatientFormModal}
            />
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
