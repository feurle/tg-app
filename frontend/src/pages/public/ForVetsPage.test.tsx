import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import ForVetsPage from './ForVetsPage';

vi.mock('../../features/webcontent/components/PageContent', () => ({ default: () => null }));

afterEach(cleanup);

describe('ForVetsPage', () => {
    it('leads with a referral button instead of the form', () => {
        const { container } = render(
            <MemoryRouter>
                <ForVetsPage />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { level: 1, name: 'Für Tierärzte' })).not.toBeNull();
        expect(screen.getByRole('link', { name: 'Patienten überweisen' }).getAttribute('href')).toBe('/referral');
        expect(container.querySelector('form')).toBeNull();
    });
});
