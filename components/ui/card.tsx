import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          'rounded-2xl bg-background-secondary p-5',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('mb-4', className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View ref={ref} className={cn('', className)} {...props} />
    );
  }
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardContent };
