import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HoneypotField from './HoneypotField';

afterEach(cleanup);

describe('HoneypotField', () => {
    it('is hidden from assistive technology and the tab order', () => {
        const { container } = render(<HoneypotField value="" onChange={() => {}} />);
        expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
        expect(container.querySelector('input')?.tabIndex).toBe(-1);
    });

    it('reports what a bot types into it', () => {
        const onChange = vi.fn();
        const { container } = render(<HoneypotField value="" onChange={onChange} />);
        fireEvent.change(container.querySelector('input')!, { target: { value: 'spam' } });
        expect(onChange).toHaveBeenCalledWith('spam');
    });
});
