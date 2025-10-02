import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SimpleChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  labels,
  color = '#2563eb',
  height = 200,
}) => {
  // Ensure we have valid data
  const validData = data.filter(value => value !== undefined && value !== null && !isNaN(value));
  
  if (validData.length === 0) {
    return (
      <View className="h-64 justify-center items-center">
        <MaterialIcons name="show-chart" size={48} color="#64748b" />
        <Text className="text-secondary mt-2">No chart data available</Text>
      </View>
    );
  }

  // Create better labels - show fewer labels for better readability
  const getOptimizedLabels = () => {
    if (validData.length <= 8) {
      return labels;
    }
    
    const step = Math.ceil(validData.length / 6); // Show max 6 labels
    return labels.map((label, index) => 
      index % step === 0 || index === labels.length - 1 ? label : ''
    );
  };

  const optimizedLabels = getOptimizedLabels();

  const chartData = {
    labels: optimizedLabels,
    datasets: [
      {
        data: validData,
        color: () => color,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => color,
    labelColor: (opacity = 1) => '#64748b',
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '2',
      strokeWidth: '1',
      stroke: color,
    },
    propsForLabels: {
      fontSize: 10,
    },
    fillShadowGradient: color,
    fillShadowGradientOpacity: 0.1,
  };

  return (
    <View className="items-center">
      <LineChart
        data={chartData}
        width={SCREEN_WIDTH - 48}
        height={height}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withVerticalLines={false}
        withHorizontalLines={true}
        withShadow={true}
        withInnerLines={false}
        withOuterLines={true}
        fromZero={false}
        segments={4}
        yAxisLabel="₹"
        yAxisSuffix=""
        verticalLabelRotation={0}
        horizontalLabelRotation={0}
        xLabelsOffset={-5}
      />
    </View>
  );
};

export default SimpleChart;