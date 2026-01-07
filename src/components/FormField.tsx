import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  helper?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, htmlFor, helper, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="input-label">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
      {helper && <p className="input-helper">{helper}</p>}
    </div>
  );
}
