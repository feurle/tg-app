import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../api';
import {
    appointmentDays,
    appointmentTimes,
    formatTime,
    groupByDay,
    practiceToday,
    weekdayName,
} from '../officeHours';
import { useVetInfo } from '../useVetInfo';
import HoneypotField from '../../../components/HoneypotField';
import { FormSection, SelectField, TextAreaField, TextField, TimeField } from '../../../components/form/FormFields';
import FormSuccess from '../../../components/form/FormSuccess';

const EMPTY = { senderName: '', replyToEmail: '', phone: '', preferredDate: '', preferredTime: '', text: '' };

/** Public appointment request. The request is only mailed to the practice, never stored. */
export default function AppointmentForm() {
    const { t, i18n } = useTranslation();
    const vetInfo = useVetInfo();
    const hours = useMemo(() => vetInfo?.officeHours ?? [], [vetInfo]);
    const [form, setForm] = useState(EMPTY);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(false);
    const [website, setWebsite] = useState('');

    const set = (key: keyof typeof EMPTY) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    const dayOptions = useMemo(
        () =>
            appointmentDays(hours).map((date) => ({
                value: date,
                label: new Date(`${date}T12:00:00Z`).toLocaleDateString(i18n.language, {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'UTC',
                }),
            })),
        [hours, i18n.language],
    );
    const timeOptions = form.preferredDate
        ? appointmentTimes(hours, form.preferredDate).map((time) => ({ value: time, label: time }))
        : [];

    /** A time that does not exist on the newly chosen day is dropped. */
    const setDate = (date: string) =>
        setForm((prev) => ({
            ...prev,
            preferredDate: date,
            preferredTime: appointmentTimes(hours, date).includes(prev.preferredTime) ? prev.preferredTime : '',
        }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        setError(false);
        try {
            await contactApi.requestAppointment({
                senderName: form.senderName,
                replyToEmail: form.replyToEmail,
                preferredDate: form.preferredDate,
                ...(form.phone.trim() && { phone: form.phone.trim() }),
                ...(form.preferredTime && { preferredTime: form.preferredTime }),
                ...(form.text.trim() && { text: form.text.trim() }),
                ...(website && { website }),
            });
            setSent(true);
        } catch {
            setError(true);
        } finally {
            setSending(false);
        }
    }

    if (sent) {
        return (
            <FormSuccess title={t('appointmentForm.success.title')}>
                <p>{t('appointmentForm.success.body')}</p>
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
                <TextField label={t('contactForm.phone')} type="tel" autoComplete="tel"
                    value={form.phone} onChange={set('phone')} />
            </FormSection>
            <FormSection legend={t('contactForm.section.appointment')}>
                <div className="form-grid">
                    {hours.length > 0 ? (
                        <>
                            <SelectField label={t('contactForm.preferredDate')} required
                                placeholder={t('contactForm.choose')} value={form.preferredDate}
                                onChange={setDate} options={dayOptions} />
                            <SelectField label={t('contactForm.preferredTime')}
                                placeholder={t('contactForm.anyTime')} value={form.preferredTime}
                                onChange={set('preferredTime')} options={timeOptions}
                                disabled={!form.preferredDate} />
                        </>
                    ) : (
                        <>
                            <TextField label={t('contactForm.preferredDate')} type="date" required
                                min={practiceToday()} value={form.preferredDate}
                                onChange={set('preferredDate')} />
                            <TimeField label={t('contactForm.preferredTime')}
                                value={form.preferredTime} onChange={set('preferredTime')} />
                        </>
                    )}
                </div>
                {hours.length > 0 && (
                    <p className="form-note">
                        {t('contactForm.officeHoursHint', {
                            hours: groupByDay(hours)
                                .map(({ day, intervals }) =>
                                    `${weekdayName(day, i18n.language)} ${intervals
                                        .map((h) => `${formatTime(h.opensAt)}–${formatTime(h.closesAt)}`)
                                        .join(', ')}`)
                                .join('; '),
                        })}
                    </p>
                )}
                <TextAreaField label={t('contactForm.note')} rows={5}
                    value={form.text} onChange={set('text')} />
            </FormSection>
            {error && <ContactError phone={vetInfo?.phone} />}
            <div className="form-actions">
                <button type="submit" disabled={sending} className="btn-primary">
                    {sending ? t('contactForm.sending') : t('appointmentForm.submit')}
                </button>
            </div>
        </form>
    );
}

export function ContactError({ phone }: { phone?: string | null }) {
    const { t } = useTranslation();
    return (
        <p role="alert" className="form-error">
            {phone ? t('contactForm.errorWithPhone', { phone }) : t('contactForm.error')}
        </p>
    );
}
