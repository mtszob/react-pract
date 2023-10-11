'use client'
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { ItemList } from '@/components/items/itemList';
import { PatientAddModal, PatientDetailsModal } from '@/modals/patientModals';
import { Patient } from '@/constants/patientConstants';


export default function Patients() {
    const { data, error, mutate }: any = useSWR('/api/patients', (url: string) => fetch(url).then(r => r.json()));
    const t = useTranslations();

    const colsObj = {
        name: t('User.name'),
        identifier: t('Patient.identifier'),
        dob: t('User.dateOfBirth'),
        'telecom.email': t('User.email')
    };
    const colorData = { colors: { null: 'var(--green)' }, colorByField: 'practitioner' };
    const filterData = { sex: { label: t('User.sex'), options: [t('User.male'), t('User.female')] } };

    if (error) return <div>{t('Error.errorWhenLoading')}</div>;
    if (!data) return <div>{t('Misc.loading')}</div>;

    return (
        <>
            <h3>{t('Patient.title')}</h3>
            <ItemList
                collection='patients' data={data} mutate={mutate}
                colsObj={colsObj} colorData={colorData}
                filterData={filterData} filterFunction={filterFunction}
                DetailsModal={PatientDetailsModal} AddModal={PatientAddModal}
            />
        </>
    )
}

const filterFunction = (items: Patient[], filter: any, t: any): Patient[] => {
    let filtered = [...items].filter(el => el.name.toLowerCase().includes(filter.name.toLowerCase()));

    if (filter.sex !== '-') { filtered = filtered.filter(el => el.isMale === (filter.sex === t('User.male'))); }

    return filtered;
};
