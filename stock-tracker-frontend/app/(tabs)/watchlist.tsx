import React from 'react';
import { View, Text, ScrollView, RefreshControl as RNRefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStock } from '../../contexts/StockContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import Loading from '../../components/common/Loading';
import StockCard from '../../components/common/StockCard';
import EmptyState from '../../components/common/EmptyState';
import RefreshControl from '../../components/common/RefreshControl';
import Button from '../../components/common/Button';

export default function WatchlistScreen() {
  const { watchlist, loading, refreshing, lastUpdated, removeFromWatchlist, refreshData } = useStock();
  const { isAuthenticated } = useAuth();

  const handleStockPress = (stock: any) => {
    router.push(`/stock/${stock.symbol}`);
  };

  const handleWatchlistRemove = (stock: any) => {
    removeFromWatchlist(stock.symbol);
  };

  const handleRefresh = () => {
    refreshData();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Loading message="Loading your watchlist..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-text">My Watchlist</Text>
        <Text className="text-secondary text-base mt-1">
          Track your favorite stocks
        </Text>
      </View>

      {/* Refresh Control */}
      <RefreshControl
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastUpdated={lastUpdated || undefined}
      />

      {/* Watchlist Content */}
      {!isAuthenticated ? (
        <EmptyState
          icon="lock"
          title="Authentication Required"
          description="Please log in to view and manage your watchlist."
          action={
            <Button
              title="Go to Login"
              onPress={() => router.push('/(auth)/login')}
            />
          }
        />
      ) : watchlist.length === 0 ? (
        <EmptyState
          icon="star-outline"
          title="Your watchlist is empty"
          description="Add stocks to your watchlist to track them here."
          action={
            <Button
              title="Browse Stocks"
              onPress={() => router.push('/(tabs)/home')}
            />
          }
        />
      ) : (
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RNRefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="p-4">
            {watchlist.map((stock, index) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onPress={() => handleStockPress(stock)}
                isInWatchlist={true}
                onWatchlistPress={() => handleWatchlistRemove(stock)}
                showWatchlistButton={true}
                className={index < watchlist.length - 1 ? 'mb-3' : ''}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}