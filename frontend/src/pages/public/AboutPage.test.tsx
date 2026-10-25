import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import AboutPage from './AboutPage';

vi.mock('../../features/webcontent/components/PageContent', () => ({ default: () => null }));

afterEach(cleanup);

describe('AboutPage', () => {
    it('has a page title for assistive technology', () => {
        render(<AboutPage />);
        expect(screen.getByRole('heading', { level: 1, name: 'Über mich' })).not.toBeNull();
    });
});
