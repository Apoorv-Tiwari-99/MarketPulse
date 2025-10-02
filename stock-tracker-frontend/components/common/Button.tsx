import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  [key: string]: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary';
      case 'outline':
        return 'bg-transparent border border-primary';
      case 'danger':
        return 'bg-danger';
      default:
        return 'bg-primary';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4';
      case 'large':
        return 'py-4 px-8';
      default:
        return 'py-3 px-6';
    }
  };

  const getTextColor = () => {
    return variant === 'outline' ? 'text-primary' : 'text-white';
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        rounded-lg items-center justify-center flex-row
        ${getVariantStyle()}
        ${getSizeStyle()}
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? '#2563eb' : '#ffffff'} 
          className="mr-2"
        />
      )}
      <Text className={`
        font-semibold
        ${getTextColor()}
        ${getTextSize()}
      `}>
        {title}
      </Text>
    </Pressable>
  );
};

export default Button;