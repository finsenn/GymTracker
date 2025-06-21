import { Tabs, router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { TabBarIcon } from '@/components/TabBarIcon';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: Colors.light.card,
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="start"
        options={{
          title: '',
          tabBarIcon: () => (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/start-workout')}
            >
              <TabBarIcon name="plus" color="#fff" />
            </TouchableOpacity>
          ),
        }}
        // *** THE FIX IS HERE ***
        // This listener now ONLY prevents the default action. It no longer
        // triggers navigation itself, making the surrounding area dead space.
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
          },
        })}
      />

      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  startButton: {
    backgroundColor: Colors.light.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
});
