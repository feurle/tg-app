import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../i18n';
import Navbar from './Navbar';

vi.mock('../features/contact/useVetInfo', () => ({ useVetInfo: () => null }));

afterEach(cleanup);

function openMenu() {
    render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Menü öffnen' }));
    const menu = screen.getByRole('dialog', { name: 'Navigation' });
    return { menu, toggle: screen.getByRole('button', { name: 'Menü schließen' }) };
}

describe('Navbar mobile menu', () => {
    it('moves the focus to the first link when it opens', () => {
        const { menu, toggle } = openMenu();

        expect(document.activeElement).toBe(within(menu).getByRole('link', { name: 'Behandlungen' }));
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(toggle.getAttribute('aria-controls')).toBe(menu.id);
    });

    it('closes on Escape and gives the focus back to the menu button', () => {
        openMenu();

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(screen.queryByRole('dialog', { name: 'Navigation' })).toBeNull();
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Menü öffnen' }));
    });

    it('keeps Tab inside the menu and its button', () => {
        const { menu, toggle } = openMenu();
        const items = menu.querySelectorAll<HTMLElement>('a, button');
        const last = items[items.length - 1];
        expect(last.textContent).toBe('Anmelden');

        last.focus();
        fireEvent.keyDown(document, { key: 'Tab' });
        expect(document.activeElement).toBe(toggle);

        fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
        expect(document.activeElement).toBe(last);
    });

    it('closes with the menu button', () => {
        const { toggle } = openMenu();

        fireEvent.click(toggle);

        expect(screen.queryByRole('dialog', { name: 'Navigation' })).toBeNull();
    });
});

function renderAt(path: string) {
    const { container } = render(
        <MemoryRouter initialEntries={[path]}>
            <Navbar />
        </MemoryRouter>,
    );
    return container.querySelector<HTMLElement>('.mobile-cta-bar');
}

describe('Navbar mobile CTA bar', () => {
    it('offers the referral on the page for vets', () => {
        const bar = renderAt('/for-vets')!;

        expect(within(bar).getByRole('link', { name: 'Patienten überweisen' }).getAttribute('href')).toBe('/referral');
        expect(within(bar).queryByRole('link', { name: 'Termin anfragen' })).toBeNull();
    });

    it('offers the appointment on the other public pages', () => {
        const bar = renderAt('/treatments')!;

        expect(within(bar).getByRole('link', { name: 'Termin anfragen' }).getAttribute('href')).toBe('/appointment');
        expect(within(bar).queryByRole('link', { name: 'Patienten überweisen' })).toBeNull();
    });

    it.each(['/appointment', '/referral'])('shows no action link on %s', (path) => {
        // Call-only page and no phone number mocked, so the bar is not rendered at all.
        expect(renderAt(path)).toBeNull();
    });
});
