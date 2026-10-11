import { useTranslation } from 'react-i18next';
import MessageForm from '../../features/contact/components/MessageForm';
import FormPage from '../../components/form/FormPage';

export default function MessagePage() {
    const { t } = useTranslation();
    return (
        <FormPage title={t('messageForm.title')} intro={t('messageForm.intro')}>
            <MessageForm />
        </FormPage>
    );
}
