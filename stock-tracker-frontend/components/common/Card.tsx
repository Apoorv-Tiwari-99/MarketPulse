import React from 'react';
import { View, Text } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  contentClassName = '',
}) => {
  return (
    <View className={`bg-card rounded-xl border border-border ${className}`}>
      {(title || subtitle) && (
        <View className="px-4 pt-4 pb-2">
          {title && (
            <Text className="text-lg font-bold text-text mb-1">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-sm text-secondary">
              {subtitle}
            </Text>
          )}
        </View>
      )}
      <View className={`p-4 ${contentClassName}`}>
        {children}
      </View>
    </View>
  );
};

export default Card;