import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReferralForm from '../../features/contact/components/ReferralForm';
import FormPage from '../../components/form/FormPage';
import { ROUTES } from '../../router/routes';

export default function ReferralPage() {
    const { t } = useTranslation();
    return (
        <FormPage
            title={t('referral.title')}
            subtitle={t('referral.subtitle')}
            intro={
                <Link to={ROUTES.FOR_VETS} className="home-more-link">
                    {t('referral.moreInfo')} →
                </Link>
            }
        >
            <ReferralForm />
        </FormPage>
    );
}
