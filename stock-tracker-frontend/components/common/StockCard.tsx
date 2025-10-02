import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Stock {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface StockCardProps {
  stock: Stock;
  onPress?: () => void;
  isInWatchlist?: boolean;
  onWatchlistPress?: () => void;
  showWatchlistButton?: boolean;
  className?: string;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  onPress,
  isInWatchlist = false,
  onWatchlistPress,
  showWatchlistButton = true,
  className = '',
}) => {
  // Safely handle undefined values with defaults
  const { 
    symbol = '', 
    companyName = '', 
    currentPrice = 0, 
    change = 0, 
    changePercent = 0 
  } = stock || {};
  
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-danger';
  const bgColor = isPositive ? 'bg-success/10' : 'bg-danger/10';

  const formatPrice = (price: number) => {
    if (price === 0) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number) => {
    if (change === 0) return 'N/A';
    return `${change >= 0 ? '+' : ''}${formatPrice(change)}`;
  };

  const formatChangePercent = (percent: number) => {
    // Handle undefined, null, or zero values
    if (percent === undefined || percent === null || percent === 0) {
      return 'N/A';
    }
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  // If stock is null or undefined, show a placeholder
  if (!stock) {
    return (
      <View className={`
        bg-card p-4 rounded-xl border border-border
        flex-row items-center justify-between
        ${className}
      `}>
        <View className="flex-1">
          <Text className="text-lg font-bold text-text">Loading...</Text>
          <Text className="text-sm text-secondary">Fetching stock data</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`
        bg-card p-4 rounded-xl border border-border
        flex-row items-center justify-between
        ${className}
      `}
    >
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-lg font-bold text-text" numberOfLines={1}>
            {symbol.replace('.NS', '')}
          </Text>
          <Text className="text-lg font-semibold text-text">
            {currentPrice > 0 ? `₹${formatPrice(currentPrice)}` : 'Price N/A'}
          </Text>
        </View>
        
        <Text className="text-sm text-secondary mb-2" numberOfLines={1}>
          {companyName}
        </Text>
        
        {currentPrice > 0 ? (
          <View className={`flex-row items-center ${bgColor} px-2 py-1 rounded-lg self-start`}>
            <MaterialIcons 
              name={isPositive ? "arrow-upward" : "arrow-downward"} 
              size={14} 
              color={isPositive ? '#10b981' : '#ef4444'} 
            />
            <Text className={`text-sm font-medium ml-1 ${changeColor}`}>
              {formatChange(change)} ({formatChangePercent(changePercent)})
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-lg self-start">
            <Text className="text-sm font-medium text-gray-600">
              Price data not available
            </Text>
          </View>
        )}
      </View>

      {showWatchlistButton && onWatchlistPress && (
        <TouchableOpacity
          onPress={onWatchlistPress}
          className="ml-3 p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons 
            name={isInWatchlist ? "star" : "star-outline"} 
            size={24} 
            color={isInWatchlist ? "#f59e0b" : "#64748b"} 
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default StockCard;