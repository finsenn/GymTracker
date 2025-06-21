import React, { useRef } from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, Pressable, Animated } from 'react-native';
import Colors from '../constants/Colors';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
  style?: ViewStyle;
}

const StyledButton: React.FC<StyledButtonProps> = ({ title, onPress, variant = 'primary', style }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  const buttonStyle: ViewStyle[] = [styles.button];
  if (variant === 'danger') buttonStyle.push(styles.dangerButton);
  else if (variant === 'secondary') buttonStyle.push(styles.secondaryButton);
  else buttonStyle.push(styles.primaryButton);

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[buttonStyle, style, { transform: [{ scale: scaleValue }] }]}>
        <Text style={styles.buttonText}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  primaryButton: { backgroundColor: Colors.light.primary },
  dangerButton: { backgroundColor: Colors.light.danger },
  secondaryButton: { backgroundColor: Colors.light.secondary },
  buttonText: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StyledButton;
