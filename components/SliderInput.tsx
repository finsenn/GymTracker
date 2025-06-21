import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Colors from '@/constants/Colors';

interface SliderInputProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, onValueChange, min, max, step }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}: <Text style={styles.valueText}>{value}</Text></Text>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={Colors.light.primary}
        maximumTrackTintColor={Colors.light.secondary}
        thumbTintColor={Colors.light.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  label: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  valueText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default SliderInput;
