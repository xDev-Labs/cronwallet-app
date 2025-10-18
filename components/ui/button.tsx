import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

const buttonVariants = cva(
  'flex-row justify-center items-start',
  {
    variants: {
      variant: {
        default: 'bg-primary rounded-[9px]',
        secondary: 'bg-secondary rounded-xl',
        outline: 'border-2 border-border bg-transparent border-primary rounded-xl',
        ghost: 'bg-transparent rounded-xl',
        destructive: 'bg-error rounded-xl',
      },
      size: {
        default: 'h-[55px] px-4 py-[13px]',
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
  'text-center font-sans text-xl tracking-[-0.04em]',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        secondary: 'text-foreground',
        outline: 'text-primary',
        ghost: 'text-foreground',
        destructive: 'text-foreground',
      },
      size: {
        default: '',
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
  const content = loading ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : typeof children === 'string' ? (
    <Text className={cn(buttonTextVariants({ variant, size }))}>
      {children}
    </Text>
  ) : (
    children
  );

  // Apply glassmorphism effect only for default variant
  if (variant === 'default') {
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
        <View style={styles.glassmorphism} className="absolute inset-0 rounded-xl" />
        {content}
      </Pressable>
    );
  }

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
      {content}
    </Pressable>
  );
});

Button.displayName = 'Button';

// Glassmorphism effects matching the design specs
const styles = StyleSheet.create({
  glassmorphism: {
    borderWidth: 1.08929,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 20.3696,
    elevation: 8,
    // Note: backdrop-filter blur(9.36786px) is not supported in React Native
    // The border and shadow create a similar glass effect
  },
});

export { Button, buttonTextVariants, buttonVariants };

