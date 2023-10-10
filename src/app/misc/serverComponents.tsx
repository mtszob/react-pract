import { useTranslations } from 'next-intl';


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
        <div className='modal-overlay' onClick={onCancel}>
            <div className='modal alert' onClick={(e) => e.stopPropagation()}>
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

export function CustomModal({ children, width = '650px', onCancel }: { children: any, width?: string, onCancel: any }) {
    return (
        <div className='modal-overlay' onClick={onCancel}>
            <div className='modal default-modal' style={{ width: width }} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

export function SSNInput({ tabIndex, ssn, setter }: { tabIndex: number, ssn: string, setter: any }) {
    return (
        <input tabIndex={tabIndex} value={ssn} maxLength={11} placeholder='xxx-xxx-xxx' onChange={(e) => {
            const numbers = e.target.value.replaceAll(/[^0-9]/g, '');

            if (numbers !== '') {
                const validSSN = numbers.split('').reduce((accumulator, currentValue) => {
                    if (accumulator.length === 3 || accumulator.length === 7) {
                        return accumulator + '-' + currentValue;
                    } else {
                        return accumulator + currentValue;
                    }
                });

                setter(validSSN.slice(0, 11));
            } else {
                setter('');
            }
        }}
        />
    )
}

