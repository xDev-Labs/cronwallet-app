import * as React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textVariants = cva('text-foreground', {
  variants: {
    variant: {
      default: '',
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-bold',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold',
      body: 'text-base',
      caption: 'text-sm text-foreground-secondary',
      muted: 'text-sm text-foreground-secondary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface TextProps
  extends RNTextProps,
    VariantProps<typeof textVariants> {}

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <RNText
        ref={ref}
        className={cn(textVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };
