import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <View className={`items-center justify-center p-8 ${className}`}>
      <MaterialIcons name={icon as any} size={64} color="#64748b" />
      <Text className="text-text text-xl font-semibold mt-4 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-secondary text-base text-center mt-2 max-w-80">
          {description}
        </Text>
      )}
      {action && (
        <View className="mt-6">
          {action}
        </View>
      )}
    </View>
  );
};

export default EmptyState;