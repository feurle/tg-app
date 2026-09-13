import { useTranslation } from 'react-i18next';
import QuestionnaireForm from '../../features/questionnaire/components/QuestionnaireForm';

export default function QuestionnairePage() {
  const { t } = useTranslation();

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 60px)' }}>
      <div className="section questionnaire-page">
        <div className="questionnaire-intro">
          <h1 className="questionnaire-title">{t('questionnaire.page.title')}</h1>
          <p className="questionnaire-subtitle">{t('questionnaire.page.subtitle')}</p>
          <p className="questionnaire-lead">{t('questionnaire.page.intro')}</p>
        </div>
        <QuestionnaireForm />
      </div>
    </div>
  );
}
