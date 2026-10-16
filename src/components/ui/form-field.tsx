'use client';

import * as React from 'react';
import { Label } from './label';
import { Input, type InputProps } from './input';
import { cn } from '@/lib/utils';

interface FormFieldProps extends InputProps {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
}

export function FormField({
  label,
  name,
  errors,
  hint,
  className,
  ...inputProps
}: FormFieldProps) {
  const hasError = errors && errors.length > 0;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        error={hasError}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
        {...inputProps}
      />
      {hint && !hasError && <p className="text-xs text-gray-500">{hint}</p>}
      {hasError && (
        <p id={`${name}-error`} className="text-xs text-nados-danger">
          {errors![0]}
        </p>
      )}
    </div>
  );
}
