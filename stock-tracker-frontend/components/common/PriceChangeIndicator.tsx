import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PriceChangeIndicatorProps {
  change: number;
  changePercent: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
}

export const PriceChangeIndicator: React.FC<PriceChangeIndicatorProps> = ({
  change = 0,
  changePercent = 0,
  size = 'medium',
  showIcon = true,
  className = '',
}) => {
  // Safely handle undefined values
  const safeChange = change || 0;
  const safeChangePercent = changePercent || 0;
  
  const isPositive = safeChange >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-danger';
  const bgColor = isPositive ? 'bg-success/10' : 'bg-danger/10';

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1';
      case 'large':
        return 'px-3 py-2';
      default:
        return 'px-2 py-1.5';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
  };

  const formatChangePercent = (percent: number) => {
    // Handle undefined or null values
    if (percent === undefined || percent === null) {
      return '0.00%';
    }
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <View className={`
      flex-row items-center rounded-lg ${bgColor} ${getSizeStyles()} ${className}
    `}>
      {showIcon && (
        <MaterialIcons 
          name={isPositive ? "arrow-upward" : "arrow-downward"} 
          size={size === 'small' ? 12 : size === 'large' ? 16 : 14} 
          color={isPositive ? '#10b981' : '#ef4444'} 
        />
      )}
      <Text className={`${getTextSize()} font-medium ml-1 ${changeColor}`}>
        {formatChange(safeChange)} ({formatChangePercent(safeChangePercent)})
      </Text>
    </View>
  );
};

export default PriceChangeIndicator;