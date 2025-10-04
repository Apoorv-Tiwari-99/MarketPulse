import React, { useState } from 'react';
import { TextInput, View, Pressable, Platform } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  FadeInUp,
} from 'react-native-reanimated';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  error = '',
  className = '',
  ...props
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isFloating = isFocused || value !== '';
  const labelPosition = useSharedValue(isFloating ? 1 : 0);
  const borderColor = useSharedValue(error ? '#ef4444' : '#d1d5db');

  const handleFocus = () => {
    setIsFocused(true);
    labelPosition.value = withTiming(1, { duration: 200 });
    borderColor.value = withTiming(error ? '#ef4444' : '#2563eb');
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value === '') {
      labelPosition.value = withTiming(0, { duration: 200 });
    }
    borderColor.value = withTiming(error ? '#ef4444' : '#d1d5db');
  };

  const animatedLabelStyle = useAnimatedStyle(() => {
    const top = interpolate(labelPosition.value, [0, 1], [Platform.OS === 'ios' ? 18 : 14, -10]);
    const fontSize = interpolate(labelPosition.value, [0, 1], [16, 12]);
    const paddingHorizontal = interpolate(labelPosition.value, [0, 1], [0, 4]);
    const color = isFocused ? '#2563eb' : (isFloating ? '#374151' : '#6b7280');

    return { top, fontSize, color, backgroundColor: '#fff', paddingHorizontal };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return { borderColor: borderColor.value };
  });

  return (
    <View className={`mb-5 ${className}`}>
      <Animated.View
        className="border-2 rounded-2xl bg-white"
        style={animatedContainerStyle}
      >
        <Animated.Text style={[animatedLabelStyle, { position: 'absolute', left: 14, zIndex: 1 }]}>
          {label}
        </Animated.Text>

        <View className="flex-row items-center px-4">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            className="flex-1 text-base text-gray-900 h-[56px] pt-2"
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="#9ca3af"
            {...props}
          />
          {secureTextEntry && (
            <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}>
              {isPasswordVisible ? (
                <EyeOff size={20} color="#6b7280" />
              ) : (
                <Eye size={20} color="#6b7280" />
              )}
            </Pressable>
          )}
        </View>
      </Animated.View>

      {error ? (
        <Animated.Text entering={FadeInUp} className="text-red-500 text-sm mt-1 ml-1">{error}</Animated.Text>
      ) : null}
    </View>
  );
};

export default Input;