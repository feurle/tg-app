import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import ReferralPage from './ReferralPage';

vi.mock('../../features/contact/components/ReferralForm', () => ({ default: () => <form aria-label="referral" /> }));

afterEach(cleanup);

function renderPage() {
    render(
        <MemoryRouter>
            <ReferralPage />
        </MemoryRouter>,
    );
}

describe('ReferralPage', () => {
    it('shows the form under its own page title', () => {
        renderPage();
        expect(screen.getByRole('heading', { level: 1, name: 'Patienten überweisen' })).not.toBeNull();
        expect(screen.getByText('* Pflichtfeld', { exact: false })).not.toBeNull();
        expect(screen.getByRole('form', { name: 'referral' })).not.toBeNull();
    });

    it('links back to the information for vets', () => {
        renderPage();
        expect(screen.getByRole('link', { name: 'Mehr zur Zusammenarbeit →' }).getAttribute('href')).toBe('/for-vets');
    });
});
