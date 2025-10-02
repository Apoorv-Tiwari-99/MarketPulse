import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Components
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import PriceChangeIndicator from '../../components/common/PriceChangeIndicator';
import Card from '../../components/common/Card';
import SimpleChart from '../../components/common/SimpleChart';

// Services
import api from '../../services/api';
import { useStock } from '../../contexts/StockContext';
import { useAuth } from '../../contexts/AuthContext';

// Update the chart intervals to use valid Yahoo Finance ranges
const CHART_INTERVALS = [
  { label: '1D', value: '1d', range: '1d' },
  { label: '1W', value: '1wk', range: '1mo' },
  { label: '1M', value: '1mo', range: '3mo' },
  { label: '3M', value: '3mo', range: '6mo' },
  { label: '1Y', value: '1y', range: '1y' },
];

// Types
interface StockDetail {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  currency: string;
  previousClose: number;
  open: number;
  dayRange: string;
  yearRange: string;
}

interface HistoricalData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams();
  const stockSymbol = Array.isArray(symbol) ? symbol[0] : symbol;

  const { watchlist, addToWatchlist, removeFromWatchlist } = useStock();
  const { isAuthenticated } = useAuth();

  const [stock, setStock] = useState<StockDetail | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState(CHART_INTERVALS[2]); // 1M default
  const [refreshing, setRefreshing] = useState(false);

  const isInWatchlist = watchlist.some(item => item.symbol === stockSymbol);

  // Fetch stock details
  const fetchStockDetail = async () => {
    try {
      setError(null);
      const response = await api.get(`/stocks/${stockSymbol}`);
      
      if (response.data.success) {
        const stockData = response.data.data;
        setStock({
          ...stockData,
          dayRange: `${stockData.low?.toFixed(2)} - ${stockData.high?.toFixed(2)}`,
          yearRange: 'N/A',
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error fetching stock details:', error);
      setError(error.response?.data?.message || 'Failed to fetch stock details');
      // Fallback to mock data
      setStock(getMockStockDetail(stockSymbol));
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async () => {
    try {
      setChartLoading(true);
      const response = await api.get(`/stocks/${stockSymbol}/historical`, {
        params: {
          interval: selectedInterval.value,
          range: selectedInterval.range,
        },
      });
      
      if (response.data.success) {
        console.log('Historical data received:', response.data.data.length, 'points');
        
        // Handle both timestamp and date formats from backend
        const data = response.data.data.map((item: any) => {
          let timestamp;
          if (item.timestamp) {
            timestamp = new Date(item.timestamp).getTime();
          } else if (item.date) {
            timestamp = new Date(item.date).getTime();
          } else {
            timestamp = Date.now();
          }
          
          return {
            timestamp,
            date: new Date(timestamp).toLocaleDateString(),
            open: item.open || 0,
            high: item.high || 0,
            low: item.low || 0,
            close: item.close || 0,
            volume: item.volume || 0,
          };
        });
        
        setHistoricalData(data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error fetching historical data:', error);
      // Fallback to mock data
      setHistoricalData(generateMockHistoricalData());
    } finally {
      setChartLoading(false);
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStockDetail(),
        fetchHistoricalData(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStockDetail();
      await fetchHistoricalData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(stockSymbol);
      } else {
        await addToWatchlist(stockSymbol);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  // Format numbers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
      return (num / 100000).toFixed(2) + ' L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + ' K';
    }
    return num.toString();
  };

  // Prepare chart data
  const getChartData = () => {
    if (historicalData.length === 0) return [];
    
    return historicalData
      .filter(item => item.close !== undefined && item.close !== null)
      .map(item => item.close);
  };

  const getChartLabels = () => {
    if (historicalData.length === 0) return [];
    
    return historicalData.map(item => {
      const date = new Date(item.timestamp);
      
      // Handle different interval formats
      switch (selectedInterval.value) {
        case '1d':
          // For 1D, show time
          return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        case '1wk':
          // For 1W, show day names
          return date.toLocaleDateString('en-IN', { weekday: 'short' });
        case '1mo':
        case '3mo':
          // For 1M-3M, show month and day
          return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        case '1y':
        case '5y':
          // For 1Y-5Y, show month and year
          return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        default:
          return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      }
    });
  };

  // Initial load
  useEffect(() => {
    if (stockSymbol) {
      loadData();
    }
  }, [stockSymbol]);

  // Update chart when interval changes
  useEffect(() => {
    if (stockSymbol) {
      fetchHistoricalData();
    }
  }, [selectedInterval, stockSymbol]);

  // Auto-refresh every 30 seconds for stock price (not chart)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchStockDetail();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshing, stockSymbol]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Loading message="Loading stock details..." />
      </SafeAreaView>
    );
  }

  if (error && !stock) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ErrorMessage
          message={error}
          onRetry={loadData}
        />
      </SafeAreaView>
    );
  }

  if (!stock) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ErrorMessage
          message="Stock not found"
          onRetry={loadData}
        />
      </SafeAreaView>
    );
  }

  const chartData = getChartData();
  const chartLabels = getChartLabels();
  const chartColor = stock.change >= 0 ? '#10b981' : '#ef4444';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-text">
                {stock.symbol.replace('.NS', '')}
              </Text>
              <Text className="text-secondary text-base mt-1" numberOfLines={2}>
                {stock.companyName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleWatchlistToggle}
              className="ml-3 p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons 
                name={isInWatchlist ? "star" : "star-outline"} 
                size={28} 
                color={isInWatchlist ? "#f59e0b" : "#64748b"} 
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-end justify-between mt-4">
            <View>
              <Text className="text-3xl font-bold text-text">
                {formatCurrency(stock.currentPrice)}
              </Text>
              <PriceChangeIndicator
                change={stock.change}
                changePercent={stock.changePercent}
                size="large"
                showIcon={true}
                className="mt-2"
              />
            </View>
            <View className="items-end">
              <Text className="text-secondary text-sm">Today's Change</Text>
              <Text className={`text-lg font-semibold ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Chart Controls */}
        <Card className="mx-4 mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-text">Price Chart</Text>
            <Text className="text-secondary text-sm">Line Chart</Text>
          </View>

          {/* Interval Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row space-x-2">
              {CHART_INTERVALS.map((interval) => (
                <TouchableOpacity
                  key={interval.value}
                  onPress={() => setSelectedInterval(interval)}
                  className={`px-4 py-2 rounded-full ${
                    selectedInterval.value === interval.value
                      ? 'bg-primary'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedInterval.value === interval.value
                        ? 'text-white'
                        : 'text-text'
                    }`}
                  >
                    {interval.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Chart */}
          {chartLoading ? (
            <View className="h-64 justify-center items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-secondary mt-2">Loading chart...</Text>
            </View>
          ) : chartData.length > 0 ? (
            <SimpleChart
              data={chartData}
              labels={chartLabels}
              color={chartColor}
              height={240}
            />
          ) : (
            <View className="h-64 justify-center items-center">
              <MaterialIcons name="show-chart" size={48} color="#64748b" />
              <Text className="text-secondary mt-2">No chart data available</Text>
              <Text className="text-secondary text-sm mt-1">Try selecting a different interval</Text>
            </View>
          )}
        </Card>

        {/* Key Statistics */}
        <Card title="Key Statistics" className="mx-4 mt-4">
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-text">Open</Text>
              <Text className="text-text font-semibold">{formatCurrency(stock.open)}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-text">Previous Close</Text>
              <Text className="text-text font-semibold">{formatCurrency(stock.previousClose)}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-text">Day's Range</Text>
              <Text className="text-text font-semibold">{stock.dayRange}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-text">Volume</Text>
              <Text className="text-text font-semibold">{formatNumber(stock.volume)}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-text">Market Cap</Text>
              <Text className="text-text font-semibold">{formatNumber(stock.marketCap)}</Text>
            </View>
          </View>
        </Card>

        {/* About Company */}
        <Card title="About Company" className="mx-4 mt-4 mb-8">
          <Text className="text-text leading-6">
            {stock.companyName} is a leading company in its sector. 
            {stock.changePercent >= 0 ? ' Showing strong performance' : ' Currently facing market challenges'} 
            with current trading activities reflecting market sentiment.
          </Text>
          <View className="mt-4">
            <Text className="text-secondary text-sm">
              Symbol: {stock.symbol}
            </Text>
            <Text className="text-secondary text-sm mt-1">
              Currency: {stock.currency}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Mock data fallback
const getMockStockDetail = (symbol: string): StockDetail => ({
  symbol,
  companyName: `${symbol.replace('.NS', '')} Limited`,
  currentPrice: 1500 + Math.random() * 1000,
  change: (Math.random() - 0.5) * 50,
  changePercent: (Math.random() - 0.5) * 5,
  high: 1600 + Math.random() * 100,
  low: 1400 + Math.random() * 100,
  volume: 1000000 + Math.random() * 5000000,
  marketCap: 100000000000 + Math.random() * 500000000000,
  currency: 'INR',
  previousClose: 1500 + (Math.random() - 0.5) * 50,
  open: 1500 + (Math.random() - 0.5) * 30,
  dayRange: '1450.00 - 1550.00',
  yearRange: '1200.00 - 1600.00',
});

const generateMockHistoricalData = (): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const basePrice = 1500;
  const now = new Date();
  
  // Generate more realistic data points
  for (let i = 60; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const open = basePrice + (Math.random() - 0.5) * 100;
    const close = open + (Math.random() - 0.5) * 50;
    const high = Math.max(open, close) + Math.random() * 30;
    const low = Math.min(open, close) - Math.random() * 30;
    
    data.push({
      timestamp: date.getTime(),
      date: date.toLocaleDateString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(1000000 + Math.random() * 5000000),
    });
  }
  
  return data;
};