import { CustomModal } from '@/modals/misc';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next-intl/client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MdSettings } from 'react-icons/md';


export function Select({ label, tabIndex, selected, options, setter }:
    { label?: string, tabIndex?: number, selected: string, options: readonly string[], setter: (str: string) => void }) {
    return (
        <>
            {label && <label style={{ display: 'flex', alignItems: 'center', fontSize: 'small' }}>{label}:</label>}
            <select tabIndex={tabIndex} value={selected} onChange={(e) => setter(e.target.value)}>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </>
    )
}

export function ConfirmAlert({ title, message, onConfirm, onCancel }: { title: string, message: string, onConfirm: any, onCancel: any }) {
    const t = useTranslations('Misc');

    return (
        <div className='popup-overlay' onClick={onCancel}>
            <div className='popup alert' onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <span>
                    <button onClick={onCancel}>{t('cancel')}</button>
                    <button onClick={onConfirm}>Ok</button>
                </span>
            </div>
        </div>
    )
}

export function SettingsButton() {
    const t = useTranslations('');
    const { replace } = useRouter();
    const [show, setShow] = useState(false);
    const pathNameWithLocale = usePathname();
    const locale = pathNameWithLocale.slice(1, 3); // 'hu' vagy 'en'
    const pathName = pathNameWithLocale.slice(3, pathNameWithLocale.length);

    return (
        <>
            <MdSettings onClick={() => setShow(true)} size='25px' />
            {show &&
                <CustomModal width='175px' onCancel={() => setShow(false)}>
                    <h3>{t('Nav.settings')}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <label>
                            {t('Nav.language')}:
                        </label>
                        <Select selected={locale} options={['en', 'hu']} setter={(str: string) => {
                            replace(pathName, { locale: str });
                        }} />
                    </div>
                </CustomModal>
            }
        </>
    )
}
