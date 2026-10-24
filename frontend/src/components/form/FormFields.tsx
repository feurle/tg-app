import { useId, type ReactNode } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  name?: string;
  autoComplete?: string;
  min?: string;
}

export function TextField({ label, value, onChange, required, type = 'text', name, autoComplete, min }: TextFieldProps) {
  const id = useId();
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}{required && ' *'}</label>
      <input id={id} name={name} className="form-input" type={type} value={value} required={required}
        autoComplete={autoComplete} min={min} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const TIME_PATTERN = '([01][0-9]|2[0-3]):[0-5][0-9]';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

/**
 * 24-hour time as `HH:mm`. `<input type="time">` follows the browser locale and shows AM/PM in some
 * browsers, which is ambiguous for office hours, so this is a text input with a pattern instead.
 */
export function TimeInput({ value, onChange, required, id, className = 'form-input', ...rest }: TimeInputProps) {
  return (
    <input id={id} className={className} type="text" inputMode="numeric" placeholder="HH:mm" maxLength={5}
      pattern={TIME_PATTERN} title="HH:mm (00:00–23:59)" required={required} aria-label={rest['aria-label']}
      value={value.slice(0, 5)} onChange={(e) => onChange(e.target.value)} />
  );
}

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function TimeField({ label, value, onChange, required }: TimeFieldProps) {
  const id = useId();
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}{required && ' *'}</label>
      <TimeInput id={id} value={value} onChange={onChange} required={required} />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  name?: string;
}

export function TextAreaField({ label, value, onChange, required, rows = 3, name }: TextAreaFieldProps) {
  const id = useId();
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}{required && ' *'}</label>
      <textarea id={id} name={name} className="form-input" rows={rows} value={value} required={required}
        onChange={(e) => onChange(e.target.value)} style={{ resize: 'vertical' }} />
    </div>
  );
}

interface ChoiceGroupProps<T extends string> {
  label: string;
  name: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  required?: boolean;
}

/** Radio buttons in a labelled group. */
export function ChoiceGroup<T extends string>({ label, name, options, value, onChange, required }: ChoiceGroupProps<T>) {
  const id = useId();
  return (
    <div className="form-group" role="radiogroup" aria-labelledby={id}>
      <span className="form-label" id={id}>{label}{required && ' *'}</span>
      <div className="form-choices">
        {options.map((option, index) => (
          <label key={option.value} className="form-choice">
            <input type="radio" name={name} value={option.value} checked={value === option.value}
              required={required && index === 0} onChange={() => onChange(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

interface YesNoProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  yes: string;
  no: string;
}

export function YesNo({ label, value, onChange, yes, no }: YesNoProps) {
  const id = useId();
  return (
    <div className="form-group" role="group" aria-labelledby={id}>
      <span className="form-label" id={id}>{label}</span>
      <div className="form-choices">
        <label className="form-choice">
          <input type="radio" checked={value === true} onChange={() => onChange(true)} /> {yes}
        </label>
        <label className="form-choice">
          <input type="radio" checked={value === false} onChange={() => onChange(false)} /> {no}
        </label>
      </div>
    </div>
  );
}

export function FormSection({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="form-section">
      <legend className="form-legend">{legend}</legend>
      {children}
    </fieldset>
  );
}
