import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

/** Confirmation card shown in place of a submitted form; takes focus so screen readers announce it. */
export default function FormSuccess({ title, children }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <div className="form-success">
      <div className="form-success-icon" aria-hidden="true">✓</div>
      <h2 ref={heading} tabIndex={-1}>{title}</h2>
      {children}
    </div>
  );
}
