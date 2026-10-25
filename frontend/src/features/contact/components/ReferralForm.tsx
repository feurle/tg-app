import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../api';
import { useVetInfo } from '../useVetInfo';
import HoneypotField from '../../../components/HoneypotField';
import { ChoiceGroup, FormSection, TextAreaField, TextField } from '../../../components/form/FormFields';
import FormSuccess from '../../../components/form/FormSuccess';
import { ContactError } from './AppointmentForm';
import type { ReferralUrgency } from '../types';

const URGENCIES: ReferralUrgency[] = ['ROUTINE', 'SOON', 'URGENT'];

const EMPTY = {
    referringPractice: '',
    referringVetName: '',
    referringEmail: '',
    referringPhone: '',
    ownerName: '',
    ownerContact: '',
    patientName: '',
    species: '',
    breed: '',
    age: '',
    question: '',
    previousTreatment: '',
    urgency: 'ROUTINE' as ReferralUrgency,
    ownerConsent: false,
};

type FormState = typeof EMPTY;

/** Public referral form for vets (see docs/ui-design.md §8). The referral is only mailed, never stored. */
export default function ReferralForm() {
    const { t } = useTranslation();
    const vetInfo = useVetInfo();
    const [form, setForm] = useState<FormState>(EMPTY);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(false);
    const [website, setWebsite] = useState('');

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    const text = (key: keyof FormState & string) => ({
        value: form[key] as string,
        onChange: (value: string) => set(key, value as never),
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        setError(false);
        const optional = (value: string) => (value.trim() ? value.trim() : undefined);
        try {
            await contactApi.requestReferral({
                referringPractice: form.referringPractice.trim(),
                referringVetName: form.referringVetName.trim(),
                referringEmail: form.referringEmail.trim(),
                referringPhone: optional(form.referringPhone),
                ownerName: form.ownerName.trim(),
                ownerContact: form.ownerContact.trim(),
                patientName: optional(form.patientName),
                species: form.species.trim(),
                breed: optional(form.breed),
                age: optional(form.age),
                question: form.question.trim(),
                previousTreatment: optional(form.previousTreatment),
                urgency: form.urgency,
                ownerConsent: form.ownerConsent,
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
            <FormSuccess title={t('referral.heading')}>
                <p>{t('referral.success')}</p>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                        setForm(EMPTY);
                        setSent(false);
                    }}
                >
                    {t('referral.again')}
                </button>
            </FormSuccess>
        );
    }

    return (
        <form className="form-stack" onSubmit={handleSubmit}>
            <HoneypotField value={website} onChange={setWebsite} />
            <FormSection legend={t('referral.practice')}>
                <div className="form-grid">
                    <TextField label={t('referral.practiceName')} required autoComplete="organization" {...text('referringPractice')} />
                    <TextField label={t('referral.vetName')} required {...text('referringVetName')} />
                    <TextField label={t('referral.email')} type="email" required autoComplete="email" {...text('referringEmail')} />
                    <TextField label={t('referral.phone')} type="tel" autoComplete="tel" {...text('referringPhone')} />
                </div>
            </FormSection>

            <FormSection legend={t('referral.owner')}>
                <div className="form-grid">
                    <TextField label={t('referral.ownerName')} required {...text('ownerName')} />
                    <TextField label={t('referral.ownerContact')} required {...text('ownerContact')} />
                </div>
            </FormSection>

            <FormSection legend={t('referral.patient')}>
                <div className="form-grid">
                    <TextField label={t('referral.patientName')} {...text('patientName')} />
                    <TextField label={t('referral.species')} required {...text('species')} />
                    <TextField label={t('referral.breed')} {...text('breed')} />
                    <TextField label={t('referral.age')} {...text('age')} />
                </div>
                <TextAreaField label={t('referral.question')} required rows={5} {...text('question')} />
                <TextAreaField label={t('referral.previous')} {...text('previousTreatment')} />
                <ChoiceGroup label={t('referral.urgency')} name="urgency" value={form.urgency}
                    options={URGENCIES.map((urgency) => ({ value: urgency, label: t(`referral.urgencyOption.${urgency}`) }))}
                    onChange={(urgency) => set('urgency', urgency)} />
            </FormSection>

            <label className="form-choice">
                <input
                    type="checkbox"
                    required
                    checked={form.ownerConsent}
                    onChange={(e) => set('ownerConsent', e.target.checked)}
                />
                {t('referral.consent')} *
            </label>

            {vetInfo?.email && <p className="form-note">{t('referral.reports', { email: vetInfo.email })}</p>}

            {error && <ContactError phone={vetInfo?.phone} />}

            <div className="form-actions">
                <button type="submit" disabled={sending} className="btn-primary">
                    {sending ? t('referral.sending') : t('referral.submit')}
                </button>
            </div>
        </form>
    );
}
