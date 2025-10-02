import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        console.log('Searching for:', query);
        searchStocks(query);
      } else {
        clearSearch();
      }
    }, 500) as unknown as number; // 500ms delay - cast to number
  }, [searchStocks, clearSearch]);

  // Clear search and timeout
  const handleClearSearch = () => {
    // Clear the timeout if it exists
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    setSearchQuery('');
    clearSearch();
  };

  // Handle stock press
  const handleStockPress = (stock: any) => {
    router.push(`/stock/${stock.symbol}`);
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = (stock: any) => {
    const isInWatchlist = watchlist.some(item => item.symbol === stock.symbol);
    if (isInWatchlist) {
      removeFromWatchlist(stock.symbol);
    } else {
      addToWatchlist(stock.symbol);
    }
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
        renderItem: ({ item }: { item: any }) => (
          <IndexCard
            index={item}
            onPress={() => console.log('Index pressed:', item.symbol)}
            className="mb-3"
          />
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
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-text">
          Welcome{user?.username ? `, ${user.username}` : ''}!
        </Text>
        <Text className="text-secondary text-base mt-1">
          Track your investments in real-time
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search stocks by symbol or name..."
          onClear={handleClearSearch}
        />
      </View>

      {/* Refresh Control */}
      <RefreshControl
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastUpdated={lastUpdated || undefined}
      />

      {/* Content */}
      {searchQuery.trim() && searchResults.length === 0 && !isSearching ? (
        <EmptyState
          icon="search-off"
          title="No stocks found"
          description={`No results found for "${searchQuery}". Try searching with different keywords.`}
        />
      ) : (
        <SectionList
          sections={getSections()}
          keyExtractor={(item, index) => `${item.symbol}-${index}`}
          stickySectionHeadersEnabled={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderSectionHeader={({ section: { title, data } }) =>
            data.length > 0 ? (
              <View className="px-4 pt-4 pb-2 bg-background">
                <Text className="text-lg font-bold text-text">{title}</Text>
              </View>
            ) : null
          }
          renderItem={({ item, section }) => {
            if (section.title === 'Market Indices') {
              return section.renderItem ? (
                <View className="px-4">
                  {section.renderItem({ item })}
                </View>
              ) : null;
            }

            return (
              <View className="px-4 mb-3">
                <StockCard
                  stock={item}
                  onPress={() => handleStockPress(item)}
                  isInWatchlist={isStockInWatchlist(item.symbol)}
                  onWatchlistPress={() => handleWatchlistToggle(item)}
                  showWatchlistButton={true}
                />
              </View>
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
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Quick Actions Footer */}
      {!searchQuery.trim() && stocks.length > 0 && (
        <View className="border-t border-border bg-card px-4 py-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-secondary text-sm">
              {stocks.length} stocks • Auto-refresh every 10s
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/watchlist')}
              className="flex-row items-center"
            >
              <MaterialIcons name="star" size={16} color="#f59e0b" />
              <Text className="text-text text-sm ml-1">
                Watchlist ({watchlist.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}