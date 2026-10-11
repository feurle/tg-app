import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { questionnaireApi } from '../api';
import { EMPTY_QUESTIONNAIRE, SPECIES, type QuestionnaireFormData, type Species } from '../types';
import { ApiError } from '../../../lib/apiClient';
import HoneypotField from '../../../components/HoneypotField';
import { ChoiceGroup, FormSection, TextAreaField as Area, TextField as Text, YesNo } from '../../../components/form/FormFields';
import FormSuccess from '../../../components/form/FormSuccess';

type Section = 'owner' | 'pet';

export default function QuestionnaireForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState<QuestionnaireFormData>(EMPTY_QUESTIONNAIRE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState('');

  function update<S extends Section>(section: S, name: keyof QuestionnaireFormData[S], value: string | boolean | null) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
  }

  function selectSpecies(species: Species) {
    // School and commands only apply to dogs: drop answers that are no longer asked.
    setForm((prev) => ({
      ...prev,
      pet: {
        ...prev.pet,
        species,
        ...(species !== 'DOG' && { school: '', knownCommands: '' }),
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await questionnaireApi.submit({ ...form, ...(website && { website }) });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('questionnaire.error'));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <FormSuccess title={t('questionnaire.success.title')}>
        <p>{t('questionnaire.success.body')}</p>
      </FormSuccess>
    );
  }

  const owner = form.owner;
  const pet = form.pet;

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <HoneypotField value={website} onChange={setWebsite} />
      <FormSection legend={t('questionnaire.section.owner')}>

        <Text label={t('questionnaire.form.owner.name')} value={owner.name}
          onChange={(v) => update('owner', 'name', v)} required />
        <Text label={t('questionnaire.form.owner.email')} type="email" value={owner.email}
          onChange={(v) => update('owner', 'email', v)} />
        <YesNo label={t('questionnaire.form.owner.firstPet')} value={owner.firstPet}
          onChange={(v) => update('owner', 'firstPet', v)} yes={t('questionnaire.yes')} no={t('questionnaire.no')} />
        <Area label={t('questionnaire.form.owner.reasonForChoosing')} value={owner.reasonForChoosing}
          onChange={(v) => update('owner', 'reasonForChoosing', v)} />
      </FormSection>

      <FormSection legend={t('questionnaire.section.pet')}>

        <Text label={t('questionnaire.form.pet.name')} value={pet.name}
          onChange={(v) => update('pet', 'name', v)} required />
        <ChoiceGroup label={t('questionnaire.form.pet.species')} name="species" required value={pet.species}
          options={SPECIES.map((species) => ({ value: species, label: t(`questionnaire.species.${species}`) }))}
          onChange={selectSpecies} />
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
        {pet.species === 'DOG' && (
          <>
            <Area label={t('questionnaire.form.pet.school')} value={pet.school}
              onChange={(v) => update('pet', 'school', v)} />
            <Area label={t('questionnaire.form.pet.knownCommands')} value={pet.knownCommands}
              onChange={(v) => update('pet', 'knownCommands', v)} />
          </>
        )}
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
      </FormSection>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-accent" disabled={submitting}>
          {submitting ? t('questionnaire.submitting') : t('questionnaire.submit')}
        </button>
      </div>
    </form>
  );
}
