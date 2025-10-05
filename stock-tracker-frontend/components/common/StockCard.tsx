import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  Layout,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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
  itemIndex?: number; // Changed from 'index' to avoid conflict
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  onPress,
  isInWatchlist = false,
  onWatchlistPress,
  showWatchlistButton = true,
  className = '',
  itemIndex = 0, // Changed from 'index'
}) => {
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
  const pulseAnim = useSharedValue(1);

  // Animated pulse effect for price changes
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }],
    };
  });

  React.useEffect(() => {
    if (currentPrice > 0) {
      pulseAnim.value = withSpring(1.05, { damping: 2 }, () => {
        pulseAnim.value = withSpring(1);
      });
    }
  }, [currentPrice]);

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
    if (percent === undefined || percent === null || percent === 0) {
      return 'N/A';
    }
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const handleWatchlistPress = () => {
    if (onWatchlistPress) {
      onWatchlistPress();
    }
  };

  if (!stock) {
    return (
      <Animated.View 
        className={`
          bg-card p-4 rounded-2xl border border-border
          flex-row items-center justify-between
          ${className}
        `}
        entering={FadeIn.delay(itemIndex * 100)}
      >
        <View className="flex-1">
          <Text className="text-lg font-bold text-text">Loading...</Text>
          <Text className="text-sm text-secondary">Fetching stock data</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInRight.delay(itemIndex * 50).springify()}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        onPress={onPress}
        className={`
          bg-card p-4 rounded-2xl border border-border
          flex-row items-center justify-between
          shadow-sm shadow-black/5
          ${className}
        `}
        activeOpacity={0.7}
      >
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center mr-2">
                <Text className="text-primary font-bold text-xs">
                  {symbol.replace('.NS', '').charAt(0)}
                </Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-text" numberOfLines={1}>
                  {symbol.replace('.NS', '')}
                </Text>
                <Text className="text-xs text-secondary" numberOfLines={1}>
                  {companyName}
                </Text>
              </View>
            </View>
            
            <Animated.View style={pulseStyle}>
              <Text className="text-lg font-semibold text-text">
                {currentPrice > 0 ? `₹${formatPrice(currentPrice)}` : 'Price N/A'}
              </Text>
            </Animated.View>
          </View>
          
          {currentPrice > 0 ? (
            <View className={`flex-row items-center ${bgColor} px-3 py-1.5 rounded-xl self-start`}>
              <MaterialIcons 
                name={isPositive ? "arrow-upward" : "arrow-downward"} 
                size={14} 
                color={isPositive ? '#10b981' : '#ef4444'} 
              />
              <Text className={`text-sm font-semibold ml-1 ${changeColor}`}>
                {formatChange(change)} ({formatChangePercent(changePercent)})
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-xl self-start">
              <Text className="text-sm font-medium text-gray-600">
                Price data not available
              </Text>
            </View>
          )}
        </View>

        {showWatchlistButton && onWatchlistPress && (
          <Animated.View 
            entering={ZoomIn.duration(300)}
            exiting={ZoomOut.duration(200)}
          >
            <TouchableOpacity
              onPress={handleWatchlistPress}
              className="ml-3 p-2 bg-background rounded-full"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons 
                name={isInWatchlist ? "star" : "star-outline"} 
                size={24} 
                color={isInWatchlist ? "#f59e0b" : "#64748b"} 
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default StockCard;