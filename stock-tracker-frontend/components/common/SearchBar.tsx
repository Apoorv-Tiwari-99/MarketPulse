import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search stocks...',
  onClear,
  className = '',
  autoFocus = false,
}) => {
  return (
    <View className={`flex-row items-center bg-card border border-border rounded-xl px-4 py-3 ${className}`}>
      <MaterialIcons name="search" size={20} color="#64748b" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        className="flex-1 ml-3 text-text text-base"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={20} color="#64748b" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;