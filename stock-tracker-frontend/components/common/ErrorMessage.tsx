import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Try Again',
  className = '',
}) => {
  return (
    <View className={`items-center justify-center p-6 ${className}`}>
      <MaterialIcons name="error-outline" size={48} color="#ef4444" />
      <Text className="text-danger text-center text-lg font-medium mt-4 mb-2">
        Something went wrong
      </Text>
      <Text className="text-secondary text-center text-base mb-4">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold text-base">
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorMessage;