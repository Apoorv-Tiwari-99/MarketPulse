import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  Layout,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { useStock } from '../../contexts/StockContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Components
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import SearchBar from '../../components/common/SearchBar';
import IndexCard from '../../components/common/IndexCard';
import StockCard from '../../components/common/StockCard';
import RefreshControl from '../../components/common/RefreshControl';
import EmptyState from '../../components/common/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Create a wrapped animated view to fix the Reanimated warning
const AnimatedHeaderView = Animated.createAnimatedComponent(View);

export default function HomeScreen() {
  const {
    indices,
    stocks,
    watchlist,
    loading,
    refreshing,
    lastUpdated,
    searchResults,
    isSearching,
    searchStocks,
    addToWatchlist,
    removeFromWatchlist,
    refreshData,
    clearSearch,
  } = useStock();

  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimeoutRef = useRef<number | null>(null);

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        searchStocks(query);
      } else {
        clearSearch();
      }
    }, 500) as unknown as number;
  }, [searchStocks, clearSearch]);

  // Clear search and timeout
  const handleClearSearch = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    setSearchQuery('');
    clearSearch();
  };

  // Handle stock press with animation
  const handleStockPress = (stock: any) => {
    router.push(`/stock/${stock.symbol}`);
  };

  // Handle watchlist toggle with animation
  const handleWatchlistToggle = (stock: any) => {
    const isInWatchlist = watchlist.some(item => item.symbol === stock.symbol);
    if (isInWatchlist) {
      removeFromWatchlist(stock.symbol);
    } else {
      addToWatchlist(stock.symbol);
    }
  };

  // Handle avatar press - navigate to profile
  const handleAvatarPress = () => {
    router.push('/(tabs)/profile');
  };

  // Check if stock is in watchlist
  const isStockInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol);
  };

  // Refresh handler
  const handleRefresh = () => {
    refreshData();
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  // Section data for SectionList
  const getSections = () => {
    if (searchQuery.trim()) {
      if (searchResults.length > 0) {
        return [
          {
            title: 'Search Results',
            data: searchResults,
          },
        ];
      }
      if (!isSearching) {
        return [
          {
            title: 'Search Results',
            data: [],
          },
        ];
      }
    }

    return [
      {
        title: 'Market Indices',
        data: indices,
        renderItem: ({ item, index }: { item: any; index: number }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
          >
            <IndexCard
              index={item}
              onPress={() => console.log('Index pressed:', item.symbol)}
              className="mb-3"
              itemIndex={index}
            />
          </Animated.View>
        ),
      },
      {
        title: 'Popular Stocks',
        data: stocks,
      },
    ];
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Loading message="Loading market data..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Fixed Header - No animations on scroll */}
      <AnimatedHeaderView 
        className="px-4 pt-4 pb-3 bg-background border-b border-border/30"
        entering={FadeIn.duration(600)}
      >
        <View className="flex-row items-center justify-between">
          {/* Splash Icon on the left */}
          <Animated.View
            entering={FadeInDown.duration(500)}
          >
            <Image
              source={require('../../assets/images/splash-icon.png')}
              className="w-10 h-10"
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* "Stocks" text on the right */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
          >
            <Text className="text-2xl font-bold text-text">
              Stocks
            </Text>
          </Animated.View>

          {/* Avatar on the right side */}
          <Animated.View
            entering={ZoomIn.delay(200).duration(500)}
          >
            <TouchableOpacity
              onPress={handleAvatarPress}
              className="w-10 h-10 bg-primary rounded-full items-center justify-center border-2 border-primary/20 active:opacity-70"
            >
              <Text className="text-white font-bold text-base">
                {getUserInitial()}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </AnimatedHeaderView>

      {/* Search Bar with reduced height */}
      <Animated.View 
        className="px-4 py-2 bg-background"
        entering={FadeInDown.delay(200).duration(500)}
      >
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search stocks by symbol or name..."
          onClear={handleClearSearch}
        />
      </Animated.View>

      {/* Content */}
      {searchQuery.trim() && searchResults.length === 0 && !isSearching ? (
        <Animated.View 
          entering={ZoomIn.duration(500)}
          className="flex-1"
        >
          <EmptyState
            icon="search-off"
            title="No stocks found"
            description={`No results found for "${searchQuery}". Try searching with different keywords.`}
          />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.delay(300)} className="flex-1">
          <SectionList
            sections={getSections()}
            keyExtractor={(item, index) => `${item.symbol}-${index}`}
            stickySectionHeadersEnabled={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderSectionHeader={({ section: { title, data } }) =>
              data.length > 0 ? (
                <Animated.View 
                  className="px-4 pt-4 pb-2 bg-background"
                  entering={SlideInRight.duration(400)}
                >
                  <Text className="text-lg font-bold text-text">{title}</Text>
                </Animated.View>
              ) : null
            }
            renderItem={({ item, section, index }) => {
              if (section.title === 'Market Indices') {
                return section.renderItem ? (
                  <View className="px-4">
                    {section.renderItem({ item, index })}
                  </View>
                ) : null;
              }

              return (
                <Animated.View 
                  className="px-4 mb-3"
                  entering={FadeInDown.delay(index * 50).springify()}
                  layout={Layout.springify()}
                >
                  <StockCard
                    stock={item}
                    onPress={() => handleStockPress(item)}
                    isInWatchlist={isStockInWatchlist(item.symbol)}
                    onWatchlistPress={() => handleWatchlistToggle(item)}
                    showWatchlistButton={true}
                    itemIndex={index}
                  />
                </Animated.View>
              );
            }}
            renderSectionFooter={({ section }) => {
              if (section.title === 'Market Indices' && section.data.length === 0 && !loading) {
                return (
                  <ErrorMessage
                    message="Failed to load market indices"
                    onRetry={refreshData}
                    className="mx-4 my-4"
                  />
                );
              }

              if (section.title === 'Popular Stocks' && section.data.length === 0 && !loading) {
                return (
                  <ErrorMessage
                    message="Failed to load stocks"
                    onRetry={refreshData}
                    className="mx-4 my-4"
                  />
                );
              }

              return null;
            }}
            ListEmptyComponent={
              !loading && !searchQuery.trim() ? (
                <ErrorMessage
                  message="Failed to load market data"
                  onRetry={refreshData}
                  className="mx-4 my-8"
                />
              ) : null
            }
            ListHeaderComponent={
              <RefreshControl
                onRefresh={handleRefresh}
                refreshing={refreshing}
                lastUpdated={lastUpdated || undefined}
              />
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}

      {/* Animated Quick Actions Footer */}
      {!searchQuery.trim() && stocks.length > 0 && (
        <Animated.View 
          className="border-t border-border bg-card px-4 py-3"
          entering={FadeInUp.delay(500).duration(400)}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-secondary text-md">
              Check your watchlist
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/watchlist')}
              className="flex-row items-center bg-warning/10 px-3 py-2 rounded-lg"
            >
              <MaterialIcons name="star" size={16} color="#f59e0b" />
              <Text className="text-text text-sm ml-1 font-medium">
                Watchlist ({watchlist.length})
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}