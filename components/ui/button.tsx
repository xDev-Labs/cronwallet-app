import * as React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border-2 border-border bg-transparent',
        ghost: 'bg-transparent',
        destructive: 'bg-error',
      },
      size: {
        default: 'h-14 px-8',
        sm: 'h-10 px-4',
        lg: 'h-16 px-10',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  'font-semibold text-center',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        secondary: 'text-foreground',
        outline: 'text-foreground',
        ghost: 'text-foreground',
        destructive: 'text-foreground',
      },
      size: {
        default: 'text-base',
        sm: 'text-sm',
        lg: 'text-lg',
        icon: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, loading, disabled, children, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      className={cn(
        buttonVariants({ variant, size, className }),
        (disabled || loading) && 'opacity-50'
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : typeof children === 'string' ? (
        <Text className={cn(buttonTextVariants({ variant, size }))}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants, buttonTextVariants };
