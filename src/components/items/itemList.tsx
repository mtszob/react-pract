import styles from './items.module.css';
import { useEffect, useState } from 'react';
import { MdAddCircle, MdArrowBackIos, MdArrowForwardIos, MdDelete, MdEdit } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { getDeepAttribute } from '@/services/misc';
import { Select } from '../misc';

type ColumnData = { label: string, field: string };
type ColorConfig = { colors: { fieldValue: any, color: string }[], colorByField: any };
type FilterData = { field: string, label: string, options: string[] }
type SortObject = { col: string, direction: string };
type ModalData = { name: string, item: any };

export function ItemList({ data, columns, colorConfig, filterConfig, filterFunction, setModalData }: {
    data: any[], columns: ColumnData[], colorConfig: ColorConfig, filterConfig: FilterData[],
    filterFunction: (data: any[], filter: any, t: any) => any[], setModalData: (modalData: ModalData) => void
}) {
    const t = useTranslations();
    const sortObj = { col: 'name', direction: 'asc' };
    const filterObj = filterConfig.reduce((acc, cur) => {
        acc[cur.field] = '-';
        return acc;
    }, {} as any);

    const [selectedFilters, setSelectedFilters] = useState({ search: '', ...filterObj });

    const filteredData = filterFunction(data, selectedFilters, t);

    return (
        <>
            <SearchBar filterConfig={filterConfig} filter={selectedFilters} setFilter={setSelectedFilters} setModalData={setModalData} />
            <Table items={filteredData} columns={columns} colorConfig={colorConfig} sortObj={sortObj} setModalData={setModalData} />
        </>
    )
}

function SearchBar({ filterConfig, filter, setFilter, setModalData }: {
    filterConfig: FilterData[], filter: any, setFilter: any, setModalData: (modalData: ModalData) => void
}) {
    const t = useTranslations('Misc');

    return (
        <div className={styles['searchbar']}>
            {Object.keys(filter).map((key, index) => {
                const fc = filterConfig.find(filter => filter.field === key);
                if (key !== 'search') {
                    return <Select key={index} label={fc!.label} selected={filter[key]}
                        options={['-', ...fc!.options]} setter={(str: any) => setFilter({ ...filter, [key]: str })}
                    />
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

function Table({ items, columns, colorConfig, sortObj, setModalData }: {
    items: any[], columns: ColumnData[], colorConfig: ColorConfig, sortObj: SortObject, setModalData: (modalData: ModalData) => void
}) {
    const t = useTranslations();
    const [sort, setSort] = useState(sortObj);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pageStart, setPageStart] = useState(0);
    const currentPage = items.sort((a, b) => sortCondition(sort, a, b)).slice(pageStart, pageStart + itemsPerPage);

    useEffect(() => { setPageStart(0); }, [items]);

    return (
        <table>
            <tbody>
                {items.length === 0 ?
                    <tr><td><h3>{t('Misc.noData')}</h3></td></tr>
                    :
                    <>
                        <tr>
                            {columns.map((column, index) =>
                                <ListHeader key={index} col={column.field} label={column.label} sort={sort} setSort={setSort} />
                            )}
                            <th key={columns.length}></th>
                            <th key={columns.length + 1}></th>
                        </tr>
                        <tr><td colSpan={columns.length + 2}><hr /></td></tr>
                        {currentPage.map((item: any) => {
                            return <ListItem key={item._id} item={item} colFields={columns.map(column => column.field)}
                                colorConfig={colorConfig} setModalData={setModalData} />;
                        })}
                        <tr><td colSpan={columns.length + 2}><hr /></td></tr>
                        <Paginator colSpan={columns.length + 2} from={pageStart} setFrom={setPageStart} listSize={items.length}
                            itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                    </>
                }
            </tbody>
        </table>
    )
}

function ListHeader({ col, label, sort, setSort }: { col: string, label: string, sort: SortObject, setSort: (sort: SortObject) => void }) {
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

function ListItem({ item, colFields, colorConfig, setModalData }: {
    item: any, colFields: string[], colorConfig: ColorConfig, setModalData: (modalData: ModalData) => void
}) {
    const color = colorConfig.colors.find(c => c.fieldValue === item[colorConfig.colorByField])?.color;

    return (
        <tr style={{ color: color }} onDoubleClick={() => setModalData({ name: 'details', item: item })}>
            {/* custom cols */}
            {colFields.map((field, index) => <td key={index + 1}>{getDeepAttribute(item, field)}</td>)}
            {/* edit and delete buttons */}
            <td>
                <MdEdit color='lime' size='25px' onClick={(e: any) => {
                    e.stopPropagation();
                    setModalData({ name: 'update', item: item });
                }} />
            </td>
            <td>
                <MdDelete color='red' size='25px' onClick={(e: any) => {
                    e.stopPropagation();
                    setModalData({ name: 'delete', item: item });
                }} />
            </td>
        </tr>
    )
}

function Paginator({ colSpan, from, setFrom, listSize, itemsPerPage, setItemsPerPage }: {
    colSpan: number, from: number, setFrom: (n: number) => void, listSize: number, itemsPerPage: number, setItemsPerPage: (n: number) => void
}) {
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

const sortCondition = (sort: SortObject, a: any, b: any) => {
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