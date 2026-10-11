import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../api';
import { useVetInfo } from '../useVetInfo';
import HoneypotField from '../../../components/HoneypotField';
import { FormSection, TextAreaField, TextField } from '../../../components/form/FormFields';
import FormSuccess from '../../../components/form/FormSuccess';
import { ContactError } from './AppointmentForm';

const EMPTY = { senderName: '', replyToEmail: '', title: '', text: '' };

/** Public message to the practice. The message is only mailed, never stored. */
export default function MessageForm() {
    const { t } = useTranslation();
    const vetInfo = useVetInfo();
    const [form, setForm] = useState(EMPTY);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(false);
    const [website, setWebsite] = useState('');

    const set = (key: keyof typeof EMPTY) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        setError(false);
        try {
            await contactApi.sendMessage({ ...form, ...(website && { website }) });
            setSent(true);
        } catch {
            setError(true);
        } finally {
            setSending(false);
        }
    }

    if (sent) {
        return (
            <FormSuccess title={t('messageForm.success.title')}>
                <p>{t('messageForm.success.body')}</p>
            </FormSuccess>
        );
    }

    return (
        <form className="form-stack" onSubmit={handleSubmit}>
            <HoneypotField value={website} onChange={setWebsite} />
            <FormSection legend={t('contactForm.section.you')}>
                <TextField label={t('contactForm.name')} required autoComplete="name"
                    value={form.senderName} onChange={set('senderName')} />
                <TextField label={t('contactForm.email')} type="email" required autoComplete="email"
                    value={form.replyToEmail} onChange={set('replyToEmail')} />
            </FormSection>
            <FormSection legend={t('contactForm.section.message')}>
                <TextField label={t('contactForm.subject')} required
                    value={form.title} onChange={set('title')} />
                <TextAreaField label={t('contactForm.message.text')} required rows={6}
                    value={form.text} onChange={set('text')} />
            </FormSection>
            {error && <ContactError phone={vetInfo?.phone} />}
            <div className="form-actions">
                <button type="submit" disabled={sending} className="btn-primary">
                    {sending ? t('contactForm.sending') : t('messageForm.submit')}
                </button>
            </div>
        </form>
    );
}
