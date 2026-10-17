interface Props {
    value: string;
    onChange: (value: string) => void;
}

/**
 * Spam trap: invisible to people (off-screen, skipped by keyboard and screen readers), but bots
 * that fill every field give themselves away. The backend drops submissions where it is filled.
 */
export default function HoneypotField({ value, onChange }: Props) {
    return (
        <div className="honeypot" aria-hidden="true">
            <label>
                Website
                <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </label>
        </div>
    );
}
