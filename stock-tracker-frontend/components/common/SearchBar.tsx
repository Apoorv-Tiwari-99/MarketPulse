import React, { useEffect } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search stocks...',
  onClear,
  className = '',
  autoFocus = false,
}) => {
  const scaleAnim = useSharedValue(1);
  const borderWidth = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      borderWidth: borderWidth.value,
    };
  });

  useEffect(() => {
    if (value.length > 0) {
      borderWidth.value = withSpring(1.5);
    } else {
      borderWidth.value = withSpring(1);
    }
  }, [value]);

  const handleFocus = () => {
    scaleAnim.value = withSpring(1.01);
    borderWidth.value = withSpring(1.5);
  };

  const handleBlur = () => {
    scaleAnim.value = withSpring(1);
    if (value.length === 0) {
      borderWidth.value = withSpring(1);
    }
  };

  return (
    <Animated.View 
      className={`flex-row items-center bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 ${className}`}
      style={animatedStyle}
      entering={FadeInRight.duration(500)}
    >
      <Animated.View entering={ZoomIn.duration(400)}>
        <MaterialIcons name="search" size={18} color="#6b7280" />
      </Animated.View>
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="flex-1 ml-2 text-gray-900 text-sm font-medium"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ fontSize: 14 }}
      />
      
      {value.length > 0 && (
        <Animated.View 
          entering={ZoomIn.duration(300)}
          exiting={ZoomOut.duration(200)}
        >
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              onClear?.();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="w-5 h-5 bg-gray-300 rounded-full items-center justify-center"
          >
            <MaterialIcons name="close" size={12} color="#6b7280" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default SearchBar;