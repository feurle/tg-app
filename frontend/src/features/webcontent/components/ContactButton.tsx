import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import ContactFormModal, {type ContactFormMode} from '../../contact/components/ContactFormModal';

export default function ContactButton() {
    const {t} = useTranslation();
    const [mode, setMode] = useState<ContactFormMode | null>(null);

    return (
        <>
            <div className="hero-actions">
                <button type="button" className="btn-primary" onClick={() => setMode('appointment')}>
                    {t('contact.appointment')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setMode('message')}>
                    {t('contact.message')}
                </button>
            </div>
            {mode && <ContactFormModal mode={mode} onClose={() => setMode(null)}/>}
        </>
    );
}
