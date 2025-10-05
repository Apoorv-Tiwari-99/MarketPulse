import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeInLeft,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
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
  itemIndex: number; // Changed from 'index' to avoid conflict
}

export const IndexCard: React.FC<IndexCardProps> = ({
  index,
  onPress,
  className = '',
  itemIndex = 0, // Changed from 'index'
}) => {
  const { symbol, indexName, currentPrice, change, changePercent } = index;
  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const CardContent = () => (
    <Animated.View 
      className={`bg-gradient-to-r from-card to-card/80 p-4 rounded-2xl border border-border/50 ${className}`}
      style={animatedStyle}
      entering={FadeInLeft.delay(itemIndex * 80).springify()}
      layout={Layout.springify()}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-3">
            <Text className="text-primary font-bold text-sm">
              {symbol.replace('^', '').charAt(0)}
            </Text>
          </View>
          <View>
            <Text className="text-base font-bold text-text" numberOfLines={1}>
              {indexName}
            </Text>
            <Text className="text-sm text-secondary" numberOfLines={1}>
              {symbol.replace('^', '')}
            </Text>
          </View>
        </View>
        <Text className="text-base font-semibold text-text">
          {formatPrice(currentPrice)}
        </Text>
      </View>
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full ${change >= 0 ? 'bg-success' : 'bg-danger'} mr-2`} />
          <Text className="text-xs text-secondary">
            Live
          </Text>
        </View>
        <PriceChangeIndicator
          change={change}
          changePercent={changePercent}
          size="medium"
          showIcon={true}
        />
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

export default IndexCard;