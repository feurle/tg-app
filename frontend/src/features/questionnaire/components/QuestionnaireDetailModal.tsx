import { useTranslation } from 'react-i18next';
import type { Questionnaire } from '../types';

interface Props {
  questionnaire: Questionnaire;
  onClose: () => void;
}

export default function QuestionnaireDetailModal({ questionnaire, onClose }: Props) {
  const { t } = useTranslation();
  const { owner, pet } = questionnaire;

  const yesNo = (value: boolean | null) =>
    value === null ? t('common.empty') : value ? t('questionnaire.yes') : t('questionnaire.no');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card questionnaire-detail" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {owner.name || t('common.empty')} · {pet.name || t('common.empty')}
        </h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {new Date(questionnaire.submittedAt).toLocaleString()}
        </p>

        <h3 className="questionnaire-detail-section">{t('questionnaire.section.owner')}</h3>
        <Row label={t('questionnaire.form.owner.name')} value={owner.name} />
        <Row label={t('questionnaire.form.owner.email')} value={owner.email} />
        <Row label={t('questionnaire.form.owner.firstPet')} value={yesNo(owner.firstPet)} />
        <Row label={t('questionnaire.form.owner.reasonForChoosing')} value={owner.reasonForChoosing} />

        <h3 className="questionnaire-detail-section">{t('questionnaire.section.pet')}</h3>
        <Row label={t('questionnaire.form.pet.name')} value={pet.name} />
        <Row label={t('questionnaire.form.pet.origin')} value={pet.origin} />
        <Row label={t('questionnaire.form.pet.breederRearing')} value={pet.breederRearing} />
        <Row label={t('questionnaire.form.pet.historyBeforeOwner')} value={pet.historyBeforeOwner} />
        <Row label={t('questionnaire.form.pet.ageWhenAcquired')} value={pet.ageWhenAcquired} />
        <Row label={t('questionnaire.form.pet.ownedSince')} value={pet.ownedSince} />
        <Row label={t('questionnaire.form.pet.neutered')} value={yesNo(pet.neutered)} />
        <Row label={t('questionnaire.form.pet.neuteredAge')} value={pet.neuteredAge} />
        <Row label={t('questionnaire.form.pet.neuteringReason')} value={pet.neuteringReason} />
        <Row label={t('questionnaire.form.pet.behaviorChangesAfterNeutering')} value={pet.behaviorChangesAfterNeutering} />
        <Row label={t('questionnaire.form.pet.school')} value={pet.school} />
        <Row label={t('questionnaire.form.pet.knownCommands')} value={pet.knownCommands} />
        <Row label={t('questionnaire.form.pet.feeding')} value={pet.feeding} />
        <Row label={t('questionnaire.form.pet.supplements')} value={pet.supplements} />
        <Row label={t('questionnaire.form.pet.digestion')} value={pet.digestion} />
        <Row label={t('questionnaire.form.pet.lastDeworming')} value={pet.lastDeworming} />
        <Row label={t('questionnaire.form.pet.bloodTest')} value={pet.bloodTest} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  const { t } = useTranslation();
  return (
    <div className="questionnaire-detail-row">
      <div className="questionnaire-detail-label">{label}</div>
      <div className="questionnaire-detail-value">{value && value.trim() ? value : t('common.empty')}</div>
    </div>
  );
}
