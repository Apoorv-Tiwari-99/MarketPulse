import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface Stock {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
  marketCap?: number;
  currency: string;
}

export interface Index {
  symbol: string;
  indexName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface StockContextType {
  indices: Index[];
  stocks: Stock[];
  watchlist: Stock[];
  loading: boolean;
  refreshing: boolean;
  lastUpdated: Date | null;
  searchResults: Stock[];
  isSearching: boolean;
  fetchIndices: () => Promise<void>;
  fetchStocks: () => Promise<void>;
  fetchWatchlist: () => Promise<void>;
  searchStocks: (query: string) => Promise<void>;
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  refreshData: () => Promise<void>;
  clearSearch: () => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [indices, setIndices] = useState<Index[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch market indices
  const fetchIndices = async () => {
    try {
      const response = await api.get('/indices');
      if (response.data.success) {
        setIndices(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error fetching indices:', error);
      setIndices(getMockIndices());
    }
  };

  // Fetch all stocks
  const fetchStocks = async () => {
    try {
      const response = await api.get('/stocks');
      if (response.data.success) {
        const validStocks = response.data.data
          .filter((stock: any) => stock && stock.symbol)
          .map((stock: any) => ({
            symbol: stock.symbol || '',
            companyName: stock.companyName || 'N/A',
            currentPrice: stock.currentPrice || 0,
            change: stock.change || 0,
            changePercent: stock.changePercent || 0,
            high: stock.high || 0,
            low: stock.low || 0,
            volume: stock.volume || 0,
            marketCap: stock.marketCap || 0,
            currency: stock.currency || 'INR'
          }));
        setStocks(validStocks);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error fetching stocks:', error);
      setStocks(getMockStocks());
    }
  };

  // Fetch user watchlist
  const fetchWatchlist = async () => {
    if (!isAuthenticated) {
      setWatchlist([]);
      return;
    }

    try {
      const response = await api.get('/watchlist');
      
      if (response.data.success) {
        const validWatchlist = response.data.data
          .filter((item: any) => item && item.symbol)
          .map((item: any) => ({
            symbol: item.symbol || '',
            companyName: item.companyName || 'N/A',
            currentPrice: item.currentPrice || 0,
            change: item.change || 0,
            changePercent: item.changePercent || 0,
            high: item.high || 0,
            low: item.low || 0,
            volume: item.volume || 0,
            marketCap: item.marketCap || 0,
            currency: item.currency || 'INR'
          }));
        
        console.log("Processed watchlist:", validWatchlist);
        setWatchlist(validWatchlist);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error fetching watchlist:', error);
      setWatchlist([]);
    }
  };

  // Search stocks - UPDATED to fetch prices
  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await api.get(`/stocks/search/${query}`);
      
      if (response.data.success) {
        console.log('Search results received:', response.data.data);
        
        // Fetch current prices for each search result
        const searchResultsWithPrices = await Promise.all(
          response.data.data.map(async (stock: any) => {
            try {
              console.log(`Fetching price for: ${stock.symbol}`);
              // Fetch current price data for each stock
              const priceResponse = await api.get(`/stocks/${stock.symbol}`);
              if (priceResponse.data.success) {
                console.log(`Price data for ${stock.symbol}:`, priceResponse.data.data);
                return {
                  symbol: stock.symbol,
                  companyName: priceResponse.data.data.companyName || stock.name || 'N/A',
                  currentPrice: priceResponse.data.data.currentPrice || 0,
                  change: priceResponse.data.data.change || 0,
                  changePercent: priceResponse.data.data.changePercent || 0,
                  high: priceResponse.data.data.high || 0,
                  low: priceResponse.data.data.low || 0,
                  volume: priceResponse.data.data.volume || 0,
                  marketCap: priceResponse.data.data.marketCap || 0,
                  currency: priceResponse.data.data.currency || 'INR'
                };
              }
            } catch (error) {
              console.error(`Error fetching price for ${stock.symbol}:`, error);
            }
            
            // Fallback if price fetch fails
            console.log(`Using fallback data for: ${stock.symbol}`);
            return {
              symbol: stock.symbol,
              companyName: stock.name || 'N/A',
              currentPrice: 0,
              change: 0,
              changePercent: 0,
              high: 0,
              low: 0,
              volume: 0,
              marketCap: 0,
              currency: 'INR'
            };
          })
        );
        setSearchResults(searchResultsWithPrices);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error searching stocks:', error);
      Alert.alert('Error', 'Failed to search stocks');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add stock to watchlist
  const addToWatchlist = async (symbol: string) => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to add stocks to your watchlist.');
      return;
    }

    try {
      const response = await api.post(`/watchlist/${symbol}`);
      if (response.data.success) {
        await fetchWatchlist();
        Alert.alert('Success', 'Stock added to watchlist');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add stock to watchlist');
    }
  };

  // Remove stock from watchlist
  const removeFromWatchlist = async (symbol: string) => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to manage your watchlist.');
      return;
    }

    try {
      const response = await api.delete(`/watchlist/${symbol}`);
      if (response.data.success) {
        await fetchWatchlist();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error removing from watchlist:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to remove stock from watchlist');
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchIndices(),
        fetchStocks(),
        fetchWatchlist(),
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  // Mock data fallback
  const getMockIndices = (): Index[] => [
    {
      symbol: '^NSEI',
      indexName: 'Nifty 50',
      currentPrice: 21453.35,
      change: 125.65,
      changePercent: 0.59,
    },
    {
      symbol: '^BSESN',
      indexName: 'Sensex',
      currentPrice: 71356.60,
      change: 234.25,
      changePercent: 0.33,
    },
  ];

  const getMockStocks = (): Stock[] => [
    {
      symbol: 'RELIANCE.NS',
      companyName: 'Reliance Industries',
      currentPrice: 2856.45,
      change: 23.50,
      changePercent: 0.83,
      currency: 'INR',
    },
    {
      symbol: 'TCS.NS',
      companyName: 'Tata Consultancy Services',
      currentPrice: 3856.75,
      change: -45.25,
      changePercent: -1.16,
      currency: 'INR',
    },
  ];

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchIndices(),
          fetchStocks(),
          fetchWatchlist(),
        ]);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isAuthenticated]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        refreshData();
      }
    }, 100000); // 10 seconds

    return () => clearInterval(interval);
  }, [refreshing]);

  const value: StockContextType = {
    indices,
    stocks,
    watchlist,
    loading,
    refreshing,
    lastUpdated,
    searchResults,
    isSearching,
    fetchIndices,
    fetchStocks,
    fetchWatchlist,
    searchStocks,
    addToWatchlist,
    removeFromWatchlist,
    refreshData,
    clearSearch,
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};