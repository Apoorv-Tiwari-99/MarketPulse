import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  [key: string]: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.2);
  const elevation = useSharedValue(8);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    shadowOpacity.value = withTiming(0.1, { duration: 150 });
    elevation.value = withTiming(2, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    shadowOpacity.value = withTiming(0.2, { duration: 150 });
    elevation.value = withTiming(8, { duration: 150 });
  };
  
  const handlePress = () => {
    if(!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: shadowOpacity.value,
    shadowRadius: 12,
    elevation: elevation.value,
  }));

  return (
    <Animated.View style={[animatedStyle, { borderRadius: 16 }]} className={className}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        {...props}
      >
        <LinearGradient
          colors={
            disabled
              ? ['#94a3b8', '#64748b']
              : ['#2563eb', '#1d4ed8']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="py-4 px-6 items-center justify-center rounded-2xl"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold tracking-wide">
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export default Button;