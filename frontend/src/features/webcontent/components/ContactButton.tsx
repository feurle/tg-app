import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ROUTES} from '../../../router/routes';

export default function ContactButton() {
    const {t} = useTranslation();

    return (
        <div className="hero-actions">
            <Link to={ROUTES.APPOINTMENT} className="btn-primary">
                {t('contact.appointment')}
            </Link>
            <Link to={ROUTES.MESSAGE} className="btn-secondary">
                {t('contact.message')}
            </Link>
        </div>
    );
}
