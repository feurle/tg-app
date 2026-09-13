import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { questionnaireApi } from '../api';
import { EMPTY_QUESTIONNAIRE, type QuestionnaireFormData } from '../types';
import { ApiError } from '../../../lib/apiClient';

type Section = 'owner' | 'pet';

export default function QuestionnaireForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState<QuestionnaireFormData>(EMPTY_QUESTIONNAIRE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<S extends Section>(section: S, name: keyof QuestionnaireFormData[S], value: string | boolean | null) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await questionnaireApi.submit(form);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('questionnaire.error'));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="questionnaire-success">
        <div className="questionnaire-success-icon">✓</div>
        <h2>{t('questionnaire.success.title')}</h2>
        <p>{t('questionnaire.success.body')}</p>
      </div>
    );
  }

  const owner = form.owner;
  const pet = form.pet;

  return (
    <form className="questionnaire-form" onSubmit={handleSubmit}>
      <fieldset className="questionnaire-section">
        <legend className="questionnaire-legend">{t('questionnaire.section.owner')}</legend>

        <Text label={t('questionnaire.form.owner.name')} value={owner.name}
          onChange={(v) => update('owner', 'name', v)} required />
        <Text label={t('questionnaire.form.owner.email')} type="email" value={owner.email}
          onChange={(v) => update('owner', 'email', v)} />
        <YesNo label={t('questionnaire.form.owner.firstPet')} value={owner.firstPet}
          onChange={(v) => update('owner', 'firstPet', v)} yes={t('questionnaire.yes')} no={t('questionnaire.no')} />
        <Area label={t('questionnaire.form.owner.reasonForChoosing')} value={owner.reasonForChoosing}
          onChange={(v) => update('owner', 'reasonForChoosing', v)} />
      </fieldset>

      <fieldset className="questionnaire-section">
        <legend className="questionnaire-legend">{t('questionnaire.section.pet')}</legend>

        <Text label={t('questionnaire.form.pet.name')} value={pet.name}
          onChange={(v) => update('pet', 'name', v)} required />
        <Area label={t('questionnaire.form.pet.origin')} value={pet.origin}
          onChange={(v) => update('pet', 'origin', v)} />
        <Area label={t('questionnaire.form.pet.breederRearing')} value={pet.breederRearing}
          onChange={(v) => update('pet', 'breederRearing', v)} />
        <Area label={t('questionnaire.form.pet.historyBeforeOwner')} value={pet.historyBeforeOwner}
          onChange={(v) => update('pet', 'historyBeforeOwner', v)} />
        <Text label={t('questionnaire.form.pet.ageWhenAcquired')} value={pet.ageWhenAcquired}
          onChange={(v) => update('pet', 'ageWhenAcquired', v)} />
        <Text label={t('questionnaire.form.pet.ownedSince')} value={pet.ownedSince}
          onChange={(v) => update('pet', 'ownedSince', v)} />
        <YesNo label={t('questionnaire.form.pet.neutered')} value={pet.neutered}
          onChange={(v) => update('pet', 'neutered', v)} yes={t('questionnaire.yes')} no={t('questionnaire.no')} />
        {pet.neutered && (
          <>
            <Text label={t('questionnaire.form.pet.neuteredAge')} value={pet.neuteredAge}
              onChange={(v) => update('pet', 'neuteredAge', v)} />
            <Area label={t('questionnaire.form.pet.neuteringReason')} value={pet.neuteringReason}
              onChange={(v) => update('pet', 'neuteringReason', v)} />
            <Area label={t('questionnaire.form.pet.behaviorChangesAfterNeutering')} value={pet.behaviorChangesAfterNeutering}
              onChange={(v) => update('pet', 'behaviorChangesAfterNeutering', v)} />
          </>
        )}
        <Area label={t('questionnaire.form.pet.school')} value={pet.school}
          onChange={(v) => update('pet', 'school', v)} />
        <Area label={t('questionnaire.form.pet.knownCommands')} value={pet.knownCommands}
          onChange={(v) => update('pet', 'knownCommands', v)} />
        <Area label={t('questionnaire.form.pet.feeding')} value={pet.feeding}
          onChange={(v) => update('pet', 'feeding', v)} />
        <Area label={t('questionnaire.form.pet.supplements')} value={pet.supplements}
          onChange={(v) => update('pet', 'supplements', v)} />
        <Area label={t('questionnaire.form.pet.digestion')} value={pet.digestion}
          onChange={(v) => update('pet', 'digestion', v)} />
        <Text label={t('questionnaire.form.pet.lastDeworming')} value={pet.lastDeworming}
          onChange={(v) => update('pet', 'lastDeworming', v)} />
        <Area label={t('questionnaire.form.pet.bloodTest')} value={pet.bloodTest}
          onChange={(v) => update('pet', 'bloodTest', v)} />
      </fieldset>

      {error && <p className="questionnaire-error">{error}</p>}

      <div className="questionnaire-actions">
        <button type="submit" className="btn-accent" disabled={submitting}>
          {submitting ? t('questionnaire.submitting') : t('questionnaire.submit')}
        </button>
      </div>
    </form>
  );
}

interface TextProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}

function Text({ label, value, onChange, required, type = 'text' }: TextProps) {
  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      <label className="form-label">{label}{required && ' *'}</label>
      <input className="form-input" type={type} value={value} required={required}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      <label className="form-label">{label}</label>
      <textarea className="form-input" rows={3} value={value}
        onChange={(e) => onChange(e.target.value)} style={{ resize: 'vertical' }} />
    </div>
  );
}

interface YesNoProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  yes: string;
  no: string;
}

function YesNo({ label, value, onChange, yes, no }: YesNoProps) {
  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      <label className="form-label">{label}</label>
      <div className="questionnaire-yesno">
        <label className="questionnaire-radio">
          <input type="radio" checked={value === true} onChange={() => onChange(true)} /> {yes}
        </label>
        <label className="questionnaire-radio">
          <input type="radio" checked={value === false} onChange={() => onChange(false)} /> {no}
        </label>
      </div>
    </div>
  );
}
