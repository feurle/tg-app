import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../api';
import { useVetInfo } from '../useVetInfo';
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

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function bind(key: keyof FormState & string) {
        return {
            name: key,
            value: form[key] as string,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                set(key, e.target.value as never),
        };
    }

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
            <section className="referral" aria-live="polite">
                <h2 className="home-heading">{t('referral.heading')}</h2>
                <p className="referral-success">{t('referral.success')}</p>
                <button
                    type="button"
                    className="btn-secondary btn-large"
                    onClick={() => {
                        setForm(EMPTY);
                        setSent(false);
                    }}
                >
                    {t('referral.again')}
                </button>
            </section>
        );
    }

    return (
        <section className="referral">
            <h2 className="home-heading">{t('referral.heading')}</h2>
            <form className="referral-form" onSubmit={handleSubmit}>
                <fieldset className="referral-fieldset">
                    <legend>{t('referral.practice')}</legend>
                    <div className="referral-grid">
                        <Field label={t('referral.practiceName')} required autoComplete="organization" {...bind('referringPractice')} />
                        <Field label={t('referral.vetName')} required {...bind('referringVetName')} />
                        <Field label={t('referral.email')} type="email" required autoComplete="email" {...bind('referringEmail')} />
                        <Field label={t('referral.phone')} type="tel" autoComplete="tel" {...bind('referringPhone')} />
                    </div>
                </fieldset>

                <fieldset className="referral-fieldset">
                    <legend>{t('referral.owner')}</legend>
                    <div className="referral-grid">
                        <Field label={t('referral.ownerName')} required {...bind('ownerName')} />
                        <Field label={t('referral.ownerContact')} required {...bind('ownerContact')} />
                    </div>
                </fieldset>

                <fieldset className="referral-fieldset">
                    <legend>{t('referral.patient')}</legend>
                    <div className="referral-grid">
                        <Field label={t('referral.patientName')} {...bind('patientName')} />
                        <Field label={t('referral.species')} required {...bind('species')} />
                        <Field label={t('referral.breed')} {...bind('breed')} />
                        <Field label={t('referral.age')} {...bind('age')} />
                    </div>
                </fieldset>

                <div className="form-group">
                    <label className="form-label" htmlFor="referral-question">{t('referral.question')} *</label>
                    <textarea id="referral-question" rows={5} className="form-input" required {...bind('question')} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="referral-previous">{t('referral.previous')}</label>
                    <textarea id="referral-previous" rows={3} className="form-input" {...bind('previousTreatment')} />
                </div>

                <fieldset className="referral-fieldset">
                    <legend>{t('referral.urgency')}</legend>
                    <div className="referral-urgency">
                        {URGENCIES.map((urgency) => (
                            <label key={urgency} className="referral-radio">
                                <input
                                    type="radio"
                                    name="urgency"
                                    value={urgency}
                                    checked={form.urgency === urgency}
                                    onChange={() => set('urgency', urgency)}
                                />
                                {t(`referral.urgencyOption.${urgency}`)}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label className="referral-radio referral-consent">
                    <input
                        type="checkbox"
                        required
                        checked={form.ownerConsent}
                        onChange={(e) => set('ownerConsent', e.target.checked)}
                    />
                    {t('referral.consent')}
                </label>

                {vetInfo?.email && <p className="referral-note">{t('referral.reports', { email: vetInfo.email })}</p>}

                {error && (
                    <p role="alert" className="referral-error">
                        {t('referral.error')}
                    </p>
                )}

                <button type="submit" disabled={sending} className="btn-primary btn-large">
                    {sending ? t('referral.sending') : t('referral.submit')}
                </button>
            </form>
        </section>
    );
}

interface FieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    autoComplete?: string;
}

function Field({ label, name, value, onChange, required, type = 'text', autoComplete }: FieldProps) {
    const id = `referral-${name}`;
    return (
        <div className="form-group">
            <label className="form-label" htmlFor={id}>
                {label}
                {required ? ' *' : ''}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                className="form-input"
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
            />
        </div>
    );
}
