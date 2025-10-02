import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  message?: string;
  overlay?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  message = 'Loading...',
  overlay = false,
  className = '',
}) => {
  const containerStyle = overlay 
    ? 'absolute inset-0 bg-black/50 justify-center items-center z-50'
    : 'flex-1 justify-center items-center bg-background';

  return (
    <View className={`${containerStyle} ${className}`}>
      <View className={`items-center ${overlay ? 'bg-card p-6 rounded-2xl' : ''}`}>
        <ActivityIndicator size={size} color="#2563eb" />
        {message && (
          <Text className={`mt-4 text-text ${overlay ? 'text-white' : ''}`}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

export default Loading;