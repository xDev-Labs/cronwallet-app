import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  error?: boolean;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, error, placeholderTextColor, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          'h-14 rounded-xl border-2 border-border bg-background-secondary px-4 text-base text-foreground',
          'focus:border-border-focus',
          error && 'border-error',
          className
        )}
        placeholderTextColor={placeholderTextColor ?? '#8E8E93'}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
