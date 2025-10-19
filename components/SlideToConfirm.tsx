import { ChevronRight } from 'lucide-react-native';
import { useRef } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from './ui/text';

interface SlideToConfirmProps {
  onConfirm: () => void;
  text?: string;
}

const SLIDER_HEIGHT = 64;
const SLIDER_BUTTON_SIZE = 56;
const SLIDER_PADDING = 4;

export const SlideToConfirm = ({ onConfirm, text = 'SLIDE TO CONFIRM' }: SlideToConfirmProps) => {
  const containerRef = useRef<View>(null);
  const translateX = useSharedValue(0);
  const maxTranslate = useSharedValue(0);
  const hasTriggered = useSharedValue(false);

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      hasTriggered.value = false;
    })
    .onChange((event) => {
      // Only allow sliding to the right
      const newTranslateX = Math.max(0, Math.min(event.translationX, maxTranslate.value));
      translateX.value = newTranslateX;

      // Check if slider has reached the end (90% threshold)
      const threshold = maxTranslate.value * 0.9;
      if (newTranslateX >= threshold && !hasTriggered.value) {
        hasTriggered.value = true;
        runOnJS(handleConfirm)();
      }
    })
    .onEnd(() => {
      // Snap back if not triggered
      if (!hasTriggered.value) {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  const animatedSliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = 1 - translateX.value / (maxTranslate.value || 1);
    return {
      opacity: Math.max(0, opacity),
    };
  });

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    // Max translate is container width minus button size minus padding
    maxTranslate.value = width - SLIDER_BUTTON_SIZE - SLIDER_PADDING * 2;
  };

  return (
    <View
      ref={containerRef}
      onLayout={handleLayout}
      className="bg-gray-100 rounded-xl overflow-hidden"
      style={{ height: SLIDER_HEIGHT }}
    >
      {/* Background Text */}
      <Animated.View
        className="absolute inset-0 flex-row items-center justify-center"
        style={animatedTextStyle}
      >
        <Text className="text-gray-500 text-base font-medium tracking-wide">
          {text}
        </Text>
      </Animated.View>

      {/* Draggable Slider */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            animatedSliderStyle,
            {
              position: 'absolute',
              left: SLIDER_PADDING,
              top: SLIDER_PADDING,
              width: SLIDER_BUTTON_SIZE,
              height: SLIDER_BUTTON_SIZE,
            },
          ]}
          className="bg-[#4A3DFF] rounded-lg items-center justify-center"
        >
          <ChevronRight size={24} color="#fff" strokeWidth={3} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
