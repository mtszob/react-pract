'use client'
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { ItemList } from '@/components/items/itemList';
import { PractitionerFormModal, PractitionerDetailsModal } from '@/modals/practitionerModals';
import { Practitioner } from '@/constants/practitionerConstants';
import { getDeepAttribute } from '@/services/misc';
import { getAll } from '@/services/practitionerService';
import { ConfirmAlert } from '@/components/misc';
import { toast } from 'react-toastify';
import { add, remove, update } from '@/services/userService';
import { useState } from 'react';


export default function Practitioners() {
    const t = useTranslations();
    const { data, error, mutate }: any = useSWR('/api/practitioners', () => getAll().then(res => res.data));

    const columns = [
        { label: t('User.name'), field: 'name' },
        { label: t('User.dateOfBirth'), field: 'dob' },
        { label: t('User.phone'), field: 'telecom.phone' },
        { label: t('User.email'), field: 'telecom.email' },
    ];

    const colorConfig = { colors: [{ fieldValue: true, color: 'red' }], colorByField: 'admin' };

    const filterConfig = [
        { field: 'sex', label: t('User.sex'), options: [t('User.male'), t('User.female')] },
        { field: 'role', label: t('Practitioner.role'), options: [t('Practitioner.user'), t('Practitioner.admin')] }
    ];

    const [modalData, setModalData] = useState<{ name: string, item: any }>({ name: '', item: null });
    const hideModals = () => setModalData({ name: '', item: null });

    if (error) return <h3>{t('Error.errorWhenLoading')}</h3>;
    if (!data) return <h3>{t('Misc.loading')}</h3>;

    return (
        <>
            <h3>{t('Practitioner.title')}</h3>
            <ItemList
                data={data} columns={columns} colorConfig={colorConfig} filterConfig={filterConfig}
                filterFunction={filterFunction} setModalData={setModalData}
            />
            {modalData.name === 'details' &&
                <PractitionerDetailsModal data={modalData.item!} hide={hideModals} />
            }
            {modalData.name === 'add' &&
                <PractitionerFormModal hide={hideModals} onSave={(item: any) => {
                    add('practitioners', item).then(() => {
                        mutate().then(() => {
                            hideModals();
                            toast(t(`Toast.practitionersAddSuccess`), { type: 'success' });
                        });
                    }).catch(err => {
                        console.error(err);
                        toast(t(`Toast.practitionersAddError`), { type: 'error' });
                    });
                }} />
            }
            {modalData.name === 'update' &&
                <PractitionerFormModal data={modalData.item} hide={hideModals} onSave={(item: any) => {
                    update('practitioners', item).then(() => {
                        mutate().then(() => {
                            hideModals();
                            toast(t(`Toast.practitionersUpdateSuccess`), { type: 'success' });
                        });
                    }).catch(err => {
                        console.error(err);
                        toast(t(`Toast.practitionersUpdateError`), { type: 'error' });
                    });
                }} />
            }
            {modalData.name === 'delete' &&
                <ConfirmAlert title={t('Misc.deleteItem')} message={t('Misc.deleteConfirm', { item: modalData!.item!.name })} onCancel={hideModals}
                    onConfirm={() => {
                        remove('practitioners', modalData.item!).then(() => {
                            mutate().then(() => {
                                hideModals();
                                toast(t(`Toast.practitionersDeleteSuccess`), { type: 'success' });
                            });
                        }).catch(err => {
                            console.error(err);
                            toast(t(`Toast.practitionersDeleteError`), { type: 'error' });
                        });
                    }} />
            }
        </>
    )
}

const filterFunction = (items: Practitioner[], filter: any, t: any): Practitioner[] => {
    const searchColumns = ['name', 'dob', 'telecom.phone', 'telecom.email'];
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

    if (filter.role !== '-') { filtered = filtered.filter(el => el.admin === (filter.role === t('Practitioner.admin'))); }
    if (filter.sex !== '-') { filtered = filtered.filter(el => el.isMale === (filter.sex === t('User.male'))); }

    return filtered;
};
