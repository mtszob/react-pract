import styles from './modals.module.css';

export function CustomModal({ children, width = 'unset', height = 'unset', onCancel }: { children: React.ReactNode, width?: string, height?: string, onCancel: any }) {
    return (
        <div className='popup-overlay' onClick={onCancel}>
            <div className={`popup ${styles['default-modal']}`} style={{ width: width, height: height }} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}
