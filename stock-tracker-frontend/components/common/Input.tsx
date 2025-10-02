import React from 'react';
import { TextInput, View, Text } from 'react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = '',
  className = '',
  ...props
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-text mb-2">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        className={`
          border rounded-lg px-4 py-3 text-base
          ${error ? 'border-danger' : 'border-border'}
          focus:border-primary
        `}
        placeholderTextColor="#64748b"
        {...props}
      />
      {error ? (
        <Text className="text-danger text-sm mt-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default Input;