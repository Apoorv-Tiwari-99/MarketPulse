import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PriceChangeIndicator from './PriceChangeIndicator';

interface Index {
  symbol: string;
  indexName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface IndexCardProps {
  index: Index;
  onPress?: () => void;
  className?: string;
}

export const IndexCard: React.FC<IndexCardProps> = ({
  index,
  onPress,
  className = '',
}) => {
  const { symbol, indexName, currentPrice, change, changePercent } = index;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const CardContent = () => (
    <View className={`bg-card p-4 rounded-xl border border-border ${className}`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-text" numberOfLines={1}>
          {indexName}
        </Text>
        <Text className="text-base font-semibold text-text">
          {formatPrice(currentPrice)}
        </Text>
      </View>
      
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-secondary" numberOfLines={1}>
          {symbol.replace('^', '')}
        </Text>
        <PriceChangeIndicator
          change={change}
          changePercent={changePercent}
          size="small"
          showIcon={true}
        />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

export default IndexCard;