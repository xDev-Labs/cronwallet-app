import * as React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'flex-row items-center justify-center rounded-full px-3 py-1',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-background-tertiary',
        outline: 'border border-border bg-transparent',
        success: 'bg-green-500',
        error: 'bg-error',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const badgeTextVariants = cva('text-xs font-medium', {
  variants: {
    variant: {
      default: 'text-foreground',
      secondary: 'text-foreground',
      outline: 'text-foreground',
      success: 'text-white',
      error: 'text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {
  children: string;
}

const Badge = React.forwardRef<React.ElementRef<typeof View>, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      >
        <Text className={cn(badgeTextVariants({ variant }))}>
          {children}
        </Text>
      </View>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
