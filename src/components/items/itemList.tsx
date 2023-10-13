import styles from './items.module.css';
import { FunctionComponent, useState } from 'react';
import { MdAddCircle, MdDelete, MdEdit } from 'react-icons/md';
import { useImmerReducer } from 'use-immer';
import { useTranslations } from 'next-intl';
import { getDeepAttribute } from '@/services/misc';
import { ConfirmAlert, Select } from '../misc';


export function ItemList({ collection, data, mutate, colsObj, colorData, filterData, filterFunction, DetailsModal, AddModal }: {
    collection: string, data: any[], mutate: any,
    colsObj: any, colorData: { colors: any, colorByField: any },
    filterData: any, filterFunction: (data: any[], filter: any, t: any) => any[],
    DetailsModal: FunctionComponent<{ data: any, hide: any }>, AddModal: FunctionComponent<{ data?: any, hide: any, onSave: any }>
}) {
    const t = useTranslations('Misc');
    const sortObj = { col: 'name', direction: 'asc' };
    const modalObj: { name: string, item: any } = { name: '', item: null };
    const filterObj: any = {};
    Object.keys(filterData).forEach(key => filterObj[key] = '-');

    const [items, dispatch] = useImmerReducer(itemReducer, data);

    const [sort, setSort] = useState(sortObj);
    const [modalData, setModalData] = useState(modalObj);
    const [filter, setFilter] = useState({ name: '', ...filterObj });
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
                <AddModal hide={hideModals} onSave={(item: any) => triggerAdd(collection, item, mutate, dispatch)} />
            }
            {modalData.name === 'details' &&
                <DetailsModal data={modalData.item!} hide={hideModals} />
            }
            {modalData.name === 'update' &&
                <AddModal data={modalData.item} hide={hideModals} onSave={(item: any) => triggerUpdate(collection, item, mutate, dispatch)} />
            }
            {modalData.name === 'delete' &&
                <ConfirmAlert title={t('deleteItem')} message={t('deleteConfirm', { item: modalData!.item!.name })}
                    onCancel={hideModals}
                    onConfirm={() => triggerDelete(collection, modalData.item!, mutate, dispatch).then(() => { hideModals() })} />
            }
        </>
    )
}

function SearchBar({ filterData, filter, setFilter, setModalData }: { filterData: any, filter: any, setFilter: any, setModalData: any }) {
    const t = useTranslations('Misc');

    return (
        <div className={styles['searchbar']}>
            {Object.keys(filter).map((key, index) => {
                if (key !== 'name') {
                    return <Select key={index} label={filterData[key].label} selected={filter[key]} options={['-', ...filterData[key].options]}
                        setter={(str: any) => setFilter({ ...filter, [key]: str })} />
                }
            })}
            <input
                type='text'
                placeholder={t('search')}
                style={{ flex: 1 }}
                value={filter.name}
                onChange={(e) => setFilter({ ...filter, name: e.target.value })}
            />
            <MdAddCircle onClick={() => setModalData({ name: 'add', item: null })} color='lime' size='25px' />
        </div>
    )
}

function Table({ colsObj, items, colorData, filter, filterFunction, sort, setSort, setModalData }: {
    colsObj: any, items: any[], colorData: { colors: any, colorByField: any },
    filter: any, filterFunction: (data: any[], filter: any, t: any) => any[], sort: any, setSort: any, setModalData: any
}) {
    const t = useTranslations();
    const filtered = filterFunction(items, filter, t).sort((a, b) => sortCondition(sort, a, b));
    const keys = Object.keys(colsObj);

    return (
        <table>
            <tbody>
                {filtered.length === 0 ?
                    <tr><td><h3>No data</h3></td></tr>
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
                        {filtered.map((item: any) => {
                            return <ListItem key={item.name} item={item} colData={keys} colorData={colorData}
                                showDetails={(item: any) => setModalData({ name: 'details', item: item })}
                                showUpdate={(item: any) => setModalData({ name: 'update', item: item })}
                                showDelete={(item: any) => setModalData({ name: 'delete', item: item })}
                            />;
                        })}
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
            {(sort.col === col) && (sort.direction === 'asc' ? '▲' : '▼')}
            <label className={styles['item-label']} onClick={() => toggleSort(col)}>
                {label}
            </label>
        </th>
    )
}

function ListItem({ item, colData, colorData, showDetails, showUpdate, showDelete }: {
    item: any, colData: string[], colorData: { colors: any, colorByField: any }, showDetails: any, showUpdate: any, showDelete: any
}) {
    return (
        <tr style={{ color: colorData.colors[item[colorData.colorByField]] }} onClick={() => showDetails(item)}>
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
        alert('Error when adding item: ' + res.statusText);
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
        alert('Error when deleting item: ' + res.statusText);
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
        alert('Error when updating item: ' + res.statusText);
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
