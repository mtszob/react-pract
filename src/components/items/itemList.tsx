import styles from './items.module.css';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { MdAddCircle, MdArrowBackIos, MdArrowForwardIos, MdDelete, MdEdit } from 'react-icons/md';
import { useImmerReducer } from 'use-immer';
import { useTranslations } from 'next-intl';
import { getDeepAttribute } from '@/services/misc';
import { ConfirmAlert, Select } from '../misc';
import { toast } from 'react-toastify';


export function ItemList({ collection, data, mutate, colsObj, colorData, filterData, filterFunction, DetailsModal, FormModal }: {
    collection: string, data: any[], mutate: any,
    colsObj: any, colorData: { colors: any, colorByField: any },
    filterData: any, filterFunction: (data: any[], filter: any, t: any) => any[],
    DetailsModal: FunctionComponent<{ data: any, hide: any }>, FormModal: FunctionComponent<{ data?: any, hide: any, onSave: any }>
}) {
    const t = useTranslations();
    const sortObj = { col: 'name', direction: 'asc' };
    const modalObj: { name: string, item: any } = { name: '', item: null };
    const filterObj: any = {};
    Object.keys(filterData).forEach(key => filterObj[key] = '-');

    const [items, dispatch] = useImmerReducer(itemReducer, data);

    const [sort, setSort] = useState(sortObj);
    const [modalData, setModalData] = useState(modalObj);
    const [filter, setFilter] = useState({ search: '', ...filterObj });
    const hideModals = () => setModalData(modalObj);

    return (
        <>
            <SearchBar filterData={filterData} filter={filter} setFilter={setFilter} setModalData={setModalData} />
            <Table
                colsObj={colsObj} items={items} colorData={colorData}
                filter={filter} filterFunction={filterFunction}
                sort={sort} setSort={setSort}
                setModalData={setModalData}
            />
            {modalData.name === 'add' &&
                <FormModal hide={hideModals} onSave={(item: any) => {
                    triggerAdd(collection, item, mutate, dispatch).then(() => {
                        hideModals();
                        toast(t(`Toast.${collection}AddSuccess`), { type: 'success' });
                    }).catch(err => {
                        console.error(err);
                        toast(t(`Toast.${collection}AddError`), { type: 'error' });
                    });
                }} />
            }
            {modalData.name === 'details' &&
                <DetailsModal data={modalData.item!} hide={hideModals} />
            }
            {modalData.name === 'update' &&
                <FormModal data={modalData.item} hide={hideModals} onSave={(item: any) => {
                    triggerUpdate(collection, item, mutate, dispatch).then(() => {
                        hideModals();
                        toast(t(`Toast.${collection}UpdateSuccess`), { type: 'success' });
                    }).catch(err => {
                        console.error(err);
                        toast(t(`Toast.${collection}UpdateError`), { type: 'error' });
                    });
                }} />
            }
            {modalData.name === 'delete' &&
                <ConfirmAlert title={t('Misc.deleteItem')} message={t('Misc.deleteConfirm', { item: modalData!.item!.name })} onCancel={hideModals}
                    onConfirm={() => {
                        triggerDelete(collection, modalData.item!, mutate, dispatch).then(() => {
                            hideModals();
                            toast(t(`Toast.${collection}DeleteSuccess`), { type: 'success' });
                        }).catch(err => {
                            console.error(err);
                            toast(t(`Toast.${collection}DeleteError`), { type: 'error' });
                        });
                    }} />
            }
        </>
    )
}

function SearchBar({ filterData, filter, setFilter, setModalData }: { filterData: any, filter: any, setFilter: any, setModalData: any }) {
    const t = useTranslations('Misc');

    return (
        <div className={styles['searchbar']}>
            {Object.keys(filter).map((key, index) => {
                if (key !== 'search') {
                    return <Select key={index} label={filterData[key].label} selected={filter[key]} options={['-', ...filterData[key].options]}
                        setter={(str: any) => setFilter({ ...filter, [key]: str })} />
                }
            })}
            <input
                type='text'
                placeholder={t('search')}
                style={{ flex: 1 }}
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
            <MdAddCircle onClick={() => setModalData({ name: 'add', item: null })} color='lime' size='25px' />
        </div>
    )
}

function Table({ colsObj, items, colorData, filter, filterFunction, sort, setSort, setModalData }: {
    colsObj: any, items: any[], colorData: { colors: any, colorByField: any },
    filter: any, filterFunction: (data: any[], filter: any, t: any) => any[], sort: any, setSort: any, setModalData: any
}) {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pageStart, setPageStart] = useState(0);
    const t = useTranslations();
    const filtered = filterFunction(items, filter, t).sort((a, b) => sortCondition(sort, a, b));
    const currentPage = filtered.slice(pageStart, pageStart + itemsPerPage);
    const keys = Object.keys(colsObj);

    useEffect(() => { setPageStart(0); }, [filter]);

    return (
        <table>
            <tbody>
                {filtered.length === 0 ?
                    <tr><td><h3>{t('Misc.noData')}</h3></td></tr>
                    :
                    <>
                        <tr>
                            {keys.map((key, index) =>
                                <ListHeader key={index} col={key} label={colsObj[key]} sort={sort} setSort={setSort} />
                            )}
                            <th key={keys.length}></th>
                            <th key={keys.length + 1}></th>
                        </tr>
                        <tr><td colSpan={keys.length + 2}><hr /></td></tr>
                        {currentPage.map((item: any) => {
                            return <ListItem key={item._id} item={item} colData={keys} colorData={colorData}
                                showDetails={(item: any) => setModalData({ name: 'details', item: item })}
                                showUpdate={(item: any) => setModalData({ name: 'update', item: item })}
                                showDelete={(item: any) => setModalData({ name: 'delete', item: item })}
                            />;
                        })}
                        <tr><td colSpan={keys.length + 2}><hr /></td></tr>
                        <Paginator colSpan={keys.length + 2} from={pageStart} setFrom={setPageStart} listSize={filtered.length}
                            itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                    </>
                }
            </tbody>
        </table>
    )
}

function ListHeader({ col, label, sort, setSort }: { col: string, label: string, sort: any, setSort: any }) {
    const toggleSort = (col: string) => {
        const direction = sort.col === col ? (sort.direction === 'asc' ? 'desc' : 'asc') : 'asc';
        setSort({ col, direction });
    };

    return (
        <th>
            <label className={styles['item-label']} onClick={() => toggleSort(col)}>
                {(sort.col === col) && (sort.direction === 'asc' ? '▲' : '▼')}
                {label}
            </label>
        </th>
    )
}

function ListItem({ item, colData, colorData, showDetails, showUpdate, showDelete }: {
    item: any, colData: string[], colorData: { colors: any, colorByField: any }, showDetails: any, showUpdate: any, showDelete: any
}) {
    return (
        <tr style={{ color: colorData.colors[item[colorData.colorByField]] }} onDoubleClick={() => showDetails(item)}>
            {/* custom cols */}
            {colData.map((col, index) => <td key={index + 1}>{getDeepAttribute(item, col)}</td>)}
            {/* edit and delete buttons */}
            <td>
                <MdEdit color='lime' size='25px' onClick={(e: any) => {
                    e.stopPropagation();
                    showUpdate(item);
                }} />
            </td>
            <td>
                <MdDelete color='red' size='25px' onClick={(e: any) => {
                    e.stopPropagation();
                    showDelete(item);
                }} />
            </td>
        </tr>
    )
}

function Paginator({ colSpan, from, setFrom, listSize, itemsPerPage, setItemsPerPage }:
    { colSpan: number, from: number, setFrom: any, listSize: number, itemsPerPage: number, setItemsPerPage: any }) {
    const t = useTranslations();
    const pageSizes = ['10', '25', '50', '100'];

    return (
        <tr>
            <td colSpan={colSpan}>
                <div className={styles['footer']}>
                    <span className={styles['paginator']}>
                        <button disabled={from === 0} onClick={() => setFrom(from - itemsPerPage)}>
                            <MdArrowBackIos size='20px' />
                        </button>
                        <label>{`${from + 1} - ${Math.min(from + itemsPerPage, listSize)} ${t('Misc.paginatorText')} ${listSize}`}</label>
                        <button disabled={from + itemsPerPage >= listSize} onClick={() => setFrom(from + itemsPerPage)}>
                            <MdArrowForwardIos size='20px' />
                        </button>
                    </span>
                    <span>
                        <Select label={t('Misc.itemsPerPage')} selected={itemsPerPage.toString()} options={pageSizes} setter={(str: string) => {
                            setFrom(0);
                            setItemsPerPage(+str);
                        }} />
                    </span>
                </div>
            </td>
        </tr>
    )
}

const sortCondition = (sort: any, a: any, b: any) => {
    let left = getDeepAttribute(a, sort.col);
    let right = getDeepAttribute(b, sort.col);

    if (typeof left === 'string' && typeof right === 'string') {
        left = left.toLowerCase();
        right = right.toLowerCase();
        return (sort.direction === 'asc' ? left > right : left < right) ? 1 : -1;
    } else {
        return sort.direction === 'asc' ? left - right : right - left;
    }
};

async function triggerAdd(collection: string, item: any, mutate: any, dispatch: any) {
    const res = await fetch('/api/' + collection, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'add', data: item }),
    });

    if (res.ok) {
        mutate().then((items: any[]) => {
            dispatch({ code: 'set', items });
        });
    } else {
        throw new Error('Error when adding item: ' + res.statusText);
    }
}

async function triggerDelete(collection: string, item: any, mutate: any, dispatch: any) {
    const res = await fetch('/api/' + collection, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'delete', data: item }),
    });

    if (res.ok) {
        mutate().then(() => {
            dispatch({ code: 'delete', id: item._id });
        });
    } else {
        throw new Error('Error when deleting item: ' + res.statusText);
    }
}

async function triggerUpdate(collection: string, item: any, mutate: any, dispatch: any) {
    const res = await fetch('/api/' + collection, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'update', data: item }),
    });

    if (res.ok) {
        mutate().then((items: any) => {
            dispatch({ code: 'set', items });
        });
    } else {
        throw new Error('Error when updating item: ' + res.statusText);
    }
}

function itemReducer(items: any, action: any) {
    switch (action.code) {
        case 'set': {
            return action.items;
        }
        case 'delete': {
            const index = items.findIndex((i: any) => i._id === action.id);
            items.splice(index, 1);
            break;
        }
        default: {
            throw Error('Unknown action: ' + action.code);
        }
    }
}
