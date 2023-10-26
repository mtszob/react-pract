import { CustomModal } from '@/modals/misc';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next-intl/client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MdArrowBack, MdSettings } from 'react-icons/md';


export function DefaultHeader({ label, backButtonClick }: { label: string, backButtonClick: any }) {
    return (
        <div className='header'>
            <MdArrowBack size='25px' onClick={backButtonClick} />
            <label>{label}</label>
        </div>
    )
}

export function Select({ label, tabIndex, selected, options, setter }:
    { label?: string, tabIndex?: number, selected: string, options: readonly string[], setter: (str: string) => void }) {
    return (
        <>
            {label && <label style={{ fontSize: 'small' }}>{label}: </label>}
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
                    <DefaultHeader label={t('Nav.settings')} backButtonClick={() => setShow(false)} />
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <label>
                            {t('Nav.language')}:
                        </label>
                        <Select selected={t(`Misc.${locale}`)} options={[t('Misc.en'), t('Misc.hu')]} setter={(str: string) => {
                            switch (str) {
                                case t('Misc.hu'): replace(pathName, { locale: 'hu' }); break;
                                case t('Misc.en'): replace(pathName, { locale: 'en' }); break;
                            }
                        }} />
                    </div>
                </CustomModal>
            }
        </>
    )
}
