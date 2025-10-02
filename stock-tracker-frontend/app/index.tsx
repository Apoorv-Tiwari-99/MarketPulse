import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import Loading from '../components/common/Loading';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  return <Loading message="Loading..." />;
}