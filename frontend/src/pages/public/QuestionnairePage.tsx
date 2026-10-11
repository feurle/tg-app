import { useTranslation } from 'react-i18next';
import QuestionnaireForm from '../../features/questionnaire/components/QuestionnaireForm';
import FormPage from '../../components/form/FormPage';

export default function QuestionnairePage() {
  const { t } = useTranslation();

  return (
    <FormPage title={t('questionnaire.page.title')} subtitle={t('questionnaire.page.subtitle')} intro={t('questionnaire.page.intro')}>
      <QuestionnaireForm />
    </FormPage>
  );
}
