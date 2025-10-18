import * as React from 'react';
import { View, Image, Text, type ViewProps, type ImageProps } from 'react-native';
import { cn } from '@/lib/utils';

interface AvatarProps extends ViewProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

const Avatar = React.forwardRef<React.ElementRef<typeof View>, AvatarProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          'relative rounded-full overflow-hidden',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<React.ElementRef<typeof Image>, ImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <Image
        ref={ref}
        className={cn('h-full w-full', className)}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends ViewProps {
  children: string;
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof View>,
  AvatarFallbackProps
>(({ className, children, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={cn(
        'h-full w-full items-center justify-center bg-primary',
        className
      )}
      {...props}
    >
      <Text className="font-bold text-foreground text-lg">
        {children}
      </Text>
    </View>
  );
});

AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
