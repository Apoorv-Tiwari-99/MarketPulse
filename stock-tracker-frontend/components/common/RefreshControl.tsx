import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RefreshControlProps {
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated?: Date;
  className?: string;
}

export const RefreshControl: React.FC<RefreshControlProps> = ({
  onRefresh,
  refreshing,
  lastUpdated,
  className = '',
}) => {
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <View className={`flex-row items-center justify-between p-4 ${className}`}>
      <View className="flex-row items-center">
        <MaterialIcons name="schedule" size={16} color="#64748b" />
        <Text className="text-secondary text-sm ml-2">
          {lastUpdated ? `Updated ${formatLastUpdated(lastUpdated)}` : 'Pull to refresh'}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={onRefresh}
        disabled={refreshing}
        className="flex-row items-center"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {refreshing ? (
          <Text className="text-primary text-sm">Refreshing...</Text>
        ) : (
          <>
            <MaterialIcons name="refresh" size={16} color="#2563eb" />
            <Text className="text-primary text-sm ml-1">Refresh</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RefreshControl;