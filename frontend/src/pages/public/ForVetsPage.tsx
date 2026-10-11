import { useTranslation } from 'react-i18next';
import PageContent from '../../features/webcontent/components/PageContent';
import ReferralForm from '../../features/contact/components/ReferralForm';
import FormPage from '../../components/form/FormPage';

export default function ForVetsPage() {
    const { t } = useTranslation();

    return (
        <FormPage title={t('forVets.title')} subtitle={t('forVets.subtitle')} requiredNote={false}>
            <PageContent slug="for-vets" />
            <ReferralForm />
        </FormPage>
    );
}
