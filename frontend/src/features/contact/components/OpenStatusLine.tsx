import { useTranslation } from 'react-i18next';
import { formatTime, getOpenStatus, weekdayName } from '../officeHours';
import type { OfficeHour } from '../types';

interface Props {
    officeHours: OfficeHour[];
}

/** One line such as "Jetzt geöffnet, bis 18:00 Uhr"; renders nothing without office hours. */
export default function OpenStatusLine({ officeHours }: Props) {
    const { t, i18n } = useTranslation();
    const status = getOpenStatus(officeHours);
    if (!status) return null;

    let text: string;
    if (status.kind === 'open') {
        text = t('openStatus.open', { time: formatTime(status.closesAt) });
    } else if (status.kind === 'later') {
        text = t('openStatus.later', { time: formatTime(status.opensAt) });
    } else if (status.next) {
        text = `${t('openStatus.closed')}. ${t('openStatus.next', {
            day: weekdayName(status.next.day, i18n.language),
            time: formatTime(status.next.opensAt),
        })}`;
    } else {
        text = t('openStatus.closed');
    }

    return (
        <p className={`open-status${status.kind === 'closed' ? '' : ' open-status-open'}`}>
            <span className="open-status-dot" aria-hidden="true" />
            {text}
        </p>
    );
}
