import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../api';

export type ContactFormMode = 'message' | 'appointment';

interface Props {
    mode: ContactFormMode;
    onClose: () => void;
}

const EMPTY = {
    senderName: '',
    replyToEmail: '',
    phone: '',
    title: '',
    text: '',
    preferredDate: '',
    preferredTime: '',
};

/** `yyyy-MM-dd` for today, used as the earliest selectable appointment date. */
function today(): string {
    return new Date().toLocaleDateString('sv');
}

export default function ContactFormModal({ mode, onClose }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = useState(EMPTY);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        setError(false);
        try {
            if (mode === 'message') {
                await contactApi.sendMessage({
                    title: form.title,
                    text: form.text,
                    replyToEmail: form.replyToEmail,
                    senderName: form.senderName,
                });
            } else {
                await contactApi.requestAppointment({
                    senderName: form.senderName,
                    replyToEmail: form.replyToEmail,
                    preferredDate: form.preferredDate,
                    ...(form.phone.trim() && { phone: form.phone.trim() }),
                    ...(form.preferredTime && { preferredTime: form.preferredTime }),
                    ...(form.text.trim() && { text: form.text.trim() }),
                });
            }
            setSent(true);
        } catch {
            setError(true);
        } finally {
            setSending(false);
        }
    }

    const heading =
        mode === 'message' ? t('contactForm.message.heading') : t('contactForm.appointment.heading');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {heading}
                </h2>

                {sent ? (
                    <>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                            {t('contactForm.success')}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={onClose} className="btn-accent">
                                {t('contactForm.close')}
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Field
                            label={t('contactForm.name')}
                            name="senderName"
                            value={form.senderName}
                            onChange={handleChange}
                            required
                        />
                        <Field
                            label={t('contactForm.email')}
                            name="replyToEmail"
                            type="email"
                            value={form.replyToEmail}
                            onChange={handleChange}
                            required
                        />

                        {mode === 'message' ? (
                            <>
                                <Field
                                    label={t('contactForm.subject')}
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                                <TextArea
                                    label={t('contactForm.message.text')}
                                    name="text"
                                    value={form.text}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <Field
                                    label={t('contactForm.phone')}
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <Field
                                        label={t('contactForm.preferredDate')}
                                        name="preferredDate"
                                        type="date"
                                        min={today()}
                                        value={form.preferredDate}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Field
                                        label={t('contactForm.preferredTime')}
                                        name="preferredTime"
                                        type="time"
                                        value={form.preferredTime}
                                        onChange={handleChange}
                                    />
                                </div>
                                <TextArea
                                    label={t('contactForm.note')}
                                    name="text"
                                    value={form.text}
                                    onChange={handleChange}
                                />
                            </>
                        )}

                        {error && (
                            <p role="alert" style={{ marginBottom: '16px', color: 'var(--danger, #c0392b)' }}>
                                {t('contactForm.error')}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button type="button" onClick={onClose} disabled={sending} className="btn-secondary">
                                {t('common.cancel')}
                            </button>
                            <button type="submit" disabled={sending} className="btn-accent">
                                {sending ? t('contactForm.sending') : t('contactForm.submit')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

interface FieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    min?: string;
}

function Field({ label, name, value, onChange, required, type = 'text', min }: FieldProps) {
    return (
        <div className="form-group" style={{ marginBottom: '16px', flex: 1 }}>
            <label className="form-label">{label}</label>
            <input
                name={name}
                type={type}
                min={min}
                className="form-input"
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}

interface TextAreaProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
}

function TextArea({ label, name, value, onChange, required }: TextAreaProps) {
    return (
        <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">{label}</label>
            <textarea
                name={name}
                rows={5}
                className="form-input"
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}
