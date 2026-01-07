import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, icon, children, className = '' }: FormSectionProps) {
  return (
    <div className={`form-section ${className}`}>
      <h3 className="form-section-title">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
