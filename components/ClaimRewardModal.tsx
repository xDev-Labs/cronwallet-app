import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import React from 'react';
import { Image, Modal, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const MODAL_HEIGHT = 200;

const withCustomSpring = (value: number) => {
  'worklet';
  return withSpring(value, {
    mass: 2.5,
    damping: 100,
    stiffness: 740,
    overshootClamping: false,
  });
};

interface ClaimRewardModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ClaimRewardModal: React.FC<ClaimRewardModalProps> = ({ visible, onClose }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Create custom entering animation that mimics the stacked modal style
  const customEntering = () => {
    'worklet';
    const animations = {
      transform: [
        {
          translateY: withSpring(-10, {
            mass: 2.5,
            damping: 100,
            stiffness: 740,
          }),
        },
        {
          scale: withSpring(1, {
            mass: 2.5,
            damping: 100,
            stiffness: 740,
          }),
        },
      ],
      opacity: withSpring(1, {
        mass: 2.5,
        damping: 100,
        stiffness: 740,
      }),
    };
    const initialValues = {
      transform: [{ translateY: 50 }, { scale: 0.95 }],
      opacity: 0,
    };
    return {
      initialValues,
      animations,
    };
  };

  const customExiting = () => {
    'worklet';
    const animations = {
      transform: [
        {
          translateY: withTiming(100, { duration: 300, easing: Easing.ease }),
        },
        {
          scale: withTiming(0.9, { duration: 300, easing: Easing.ease }),
        },
      ],
      opacity: withTiming(0, { duration: 300, easing: Easing.ease }),
    };
    const initialValues = {
      transform: [{ translateY: -10 }, { scale: 1 }],
      opacity: 1,
    };
    return {
      initialValues,
      animations,
    };
  };


  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View className="flex-1">
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-[#00000099] opacity-50"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={customEntering}
          exiting={customExiting}
          style={[
            {
              width: windowWidth * 0.8,
              left: windowWidth * 0.1,
              height: MODAL_HEIGHT,
              position: 'absolute',
              top: (windowHeight - MODAL_HEIGHT) / 2,
              backgroundColor: 'white',
              borderRadius: 35,
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowColor: '#000',
              shadowRadius: 10,
              shadowOpacity: 0.08,
              elevation: 5,
            },
          ]}
        >
          <View className="flex-1 p-6">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="bg-[#FFF4E6] w-12 h-12 rounded-full items-center justify-center mb-3">
                  <Text className="text-2xl">🎁</Text>
                </View>
                <Text variant="h3" className="text-black mb-1">Congratulations!</Text>
                <Text variant="body" className="text-foreground-secondary">
                  You've earned 50 CRON tokens
                </Text>
              </View>
              <Image
                source={require("../assets/images/gift.png")}
                className="w-20 h-20 absolute -right-2 -top-2 opacity-20"
              />
            </View>

            <View className="flex-row gap-3 mt-auto">
              <Button
                variant="outline"
                className="flex-1"
                onPress={onClose}
              >
                <Text className="text-black">Later</Text>
              </Button>
              <Button
                className="flex-1"
                onPress={() => {
                  // Handle claim action
                  onClose();
                }}
              >
                <Text className="text-white">Claim</Text>
              </Button>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};