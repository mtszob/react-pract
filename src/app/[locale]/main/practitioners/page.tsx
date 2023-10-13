'use client'
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { ItemList } from '@/components/items/itemList';
import { PractitionerAddModal, PractitionerDetailsModal } from '@/modals/practitionerModals';
import { Practitioner } from '@/constants/practitionerConstants';


export default function Practitioners() {
    const t = useTranslations();
    const { data, error, mutate }: any = useSWR('/api/practitioners', (url: string) => fetch(url).then(r => r.json()));

    if (error) return <h3>{t('Error.errorWhenLoading')}</h3>;
    if (!data) return <h3>{t('Misc.loading')}</h3>;

    const colsObj = {
        name: t('User.name'),
        dob: t('User.dateOfBirth'),
        'telecom.phone': t('User.phone'),
        'telecom.email': t('User.email')
    };
    const colorData = { colors: { true: 'red' }, colorByField: 'admin' };
    const filterData = {
        role: { label: t('Practitioner.role'), options: [t('Practitioner.user'), t('Practitioner.admin')] },
        sex: { label: t('User.sex'), options: [t('User.male'), t('User.female')] }
    };

    return (
        <>
            <h3>{t('Practitioner.title')}</h3>
            <ItemList
                collection='practitioners' data={data} mutate={mutate}
                colsObj={colsObj} colorData={colorData}
                filterData={filterData} filterFunction={filterFunction}
                DetailsModal={PractitionerDetailsModal} AddModal={PractitionerAddModal}
            />
        </>
    )
}

const filterFunction = (items: Practitioner[], filter: any, t: any): Practitioner[] => {
    let filtered = [...items].filter(el => el.name.toLowerCase().includes(filter.name.toLowerCase()));

    if (filter.role !== '-') { filtered = filtered.filter(el => el.admin === (filter.role === t('Practitioner.admin'))); }
    if (filter.sex !== '-') { filtered = filtered.filter(el => el.isMale === (filter.sex === t('User.male'))); }

    return filtered;
};
