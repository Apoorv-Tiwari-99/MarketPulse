import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { TrendingUp, UserPlus } from 'lucide-react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!username) newErrors.username = 'Username is required';
    else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const result = await register(username, email, password);
    if (!result.success) setErrors({ general: result.error || 'Registration failed' });
  };

  if (isLoading) return <Loading message="Creating account..." />;

  return (
    <LinearGradient
      colors={['#f8fafc', '#eef2ff']}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center',
            paddingVertical: 20
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6">
            
            <View className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-200/50 border border-gray-100">
              
              <Animated.View 
                entering={FadeInDown.duration(600).delay(200)}
                className="items-center justify-center mb-6"
              >
                <View className="bg-blue-100 p-4 rounded-full">
                  <UserPlus size={40} color="#2563eb" />
                </View>
              </Animated.View>

              <Animated.Text 
                entering={FadeInDown.duration(600).delay(300)}
                className="text-4xl font-extrabold text-center text-blue-600 mb-2 tracking-tight"
              >
                MarketPulse
              </Animated.Text>
              
              <Animated.Text 
                entering={FadeInDown.duration(600).delay(400)}
                className="text-lg text-center text-gray-500 mb-8"
              >
                Create Your Account & Start Tracking 📈
              </Animated.Text>

              {errors.general && (
                <Animated.Text 
                  entering={FadeInUp.duration(500)}
                  className="text-red-500 text-center mb-4"
                >
                  {errors.general}
                </Animated.Text>
              )}

              <Animated.View entering={FadeInDown.duration(600).delay(500)}>
                <Input
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  error={errors.username}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(600).delay(550)}>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(600).delay(600)}>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={errors.password}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(600).delay(650)}>
                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={errors.confirmPassword}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(600).delay(700)}>
                <Button
                  title="Create Account"
                  onPress={handleSubmit}
                  loading={isLoading}
                  className="mt-2 mb-4"
                />
              </Animated.View>

              <Animated.View 
                entering={FadeInDown.duration(600).delay(800)}
                className="flex-row justify-center mt-4 pt-4 border-t border-gray-100"
              >
                <Text className="text-gray-500">Already have an account? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/login')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-blue-600 font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}