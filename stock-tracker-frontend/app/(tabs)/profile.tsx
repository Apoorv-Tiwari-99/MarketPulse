import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useStock } from '../../contexts/StockContext';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { watchlist } = useStock();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {/* Profile Header */}
          <Card className="mb-6">
            <View className="items-center">
              <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
                <Text className="text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-xl font-bold text-text mb-1">
                {user?.username}
              </Text>
              <Text className="text-secondary text-base">
                {user?.email}
              </Text>
            </View>
          </Card>

          {/* Stats */}
          <Card title="Portfolio Overview" className="mb-6">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">
                  {watchlist.length}
                </Text>
                <Text className="text-secondary text-sm">Watchlist</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-success">
                  {watchlist.filter(stock => stock.changePercent > 0).length}
                </Text>
                <Text className="text-secondary text-sm">Gaining</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-danger">
                  {watchlist.filter(stock => stock.changePercent < 0).length}
                </Text>
                <Text className="text-secondary text-sm">Declining</Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions" className="mb-6">
            <TouchableOpacity className="flex-row items-center py-3 border-b border-border">
              <MaterialIcons name="notifications" size={24} color="#64748b" />
              <Text className="text-text text-base ml-3 flex-1">Notifications</Text>
              <MaterialIcons name="chevron-right" size={20} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-3 border-b border-border">
              <MaterialIcons name="settings" size={24} color="#64748b" />
              <Text className="text-text text-base ml-3 flex-1">Settings</Text>
              <MaterialIcons name="chevron-right" size={20} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-3">
              <MaterialIcons name="help" size={24} color="#64748b" />
              <Text className="text-text text-base ml-3 flex-1">Help & Support</Text>
              <MaterialIcons name="chevron-right" size={20} color="#64748b" />
            </TouchableOpacity>
          </Card>

          {/* Logout Button */}
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}