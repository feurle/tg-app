import { useTranslation } from 'react-i18next';
import AppointmentForm from '../../features/contact/components/AppointmentForm';
import FormPage from '../../components/form/FormPage';

export default function AppointmentPage() {
    const { t } = useTranslation();
    return (
        <FormPage title={t('appointmentForm.title')} intro={t('appointmentForm.intro')}>
            <AppointmentForm />
        </FormPage>
    );
}
