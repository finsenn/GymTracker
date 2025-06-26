import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { ExerciseLog } from '@/context/WorkoutContext';
import StyledButton from '@/components/StyledButton';
import { FontAwesome } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// This is our new reusable component for the recap screen
const RecapExerciseItem: React.FC<{ exercise: ExerciseLog }> = ({ exercise }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        // This creates the smooth animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.exerciseCard}>
            <TouchableOpacity onPress={toggleExpand} style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.light.subtitle} />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.setsContainer}>
                    {exercise.sets.map((set, setIndex) => (
                        <View key={setIndex} style={styles.setRow}>
                            <Text style={styles.setText}>Set {setIndex + 1}</Text>
                            <Text style={styles.setText}>{set.weight}kg</Text>
                            <Text style={styles.setText}>{set.reps} reps</Text>
                             
                            <Text style={styles.setText}>@ RPE {set.rpe}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};


export default function RecapScreen() {
  const params = useLocalSearchParams();
  const log: ExerciseLog[] = params.log ? JSON.parse(params.log as string) : [];
  const totalTime = params.totalTime ? parseInt(params.totalTime as string, 10) : 0;
  const date = params.date || new Date().toISOString().split('T')[0];
  
  const dateToDisplay = new Date(date as string).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const totalWorkTime = log.reduce((acc, curr) => acc + (curr.workTime || 0), 0);
  const totalRestTime = log.reduce((acc, curr) => acc + (curr.restTime || 0), 0);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.date}>{dateToDisplay}</Text>
        <Text style={styles.title}>Workout Recap</Text>
        
        <View style={styles.summaryCard}>
            <View style={styles.summaryItem}><Text style={styles.summaryLabel}>Total</Text><Text style={styles.summaryValue}>{formatTime(totalTime)}</Text></View>
            <View style={styles.summaryItem}><Text style={styles.summaryLabel}>Work</Text><Text style={styles.summaryValue}>{formatTime(totalWorkTime)}</Text></View>
            <View style={styles.summaryItem}><Text style={styles.summaryLabel}>Rest</Text><Text style={styles.summaryValue}>{formatTime(totalRestTime)}</Text></View>
            
        </View>

        {log.map((exercise, index) => (
          <RecapExerciseItem key={index} exercise={exercise} />
        ))}

        <StyledButton title="FINISH" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    scrollContainer: { padding: 20 },
    date: { fontSize: 16, fontWeight: '600', color: Colors.light.subtitle, textAlign: 'center', marginBottom: 5 },
    title: { fontSize: 32, fontWeight: 'bold', color: Colors.light.text, textAlign: 'center', marginBottom: 20 },
    summaryCard: { backgroundColor: Colors.light.card, borderRadius: 10, padding: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center' },
    summaryLabel: { color: Colors.light.subtitle, fontSize: 14 },
    summaryValue: { color: Colors.light.text, fontSize: 20, fontWeight: 'bold', marginTop: 5 },
    exerciseCard: { backgroundColor: Colors.light.card, borderRadius: 10, padding: 20, marginBottom: 15 },
    exerciseName: { color: Colors.light.primary, fontSize: 22, fontWeight: 'bold' },
    setRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    setText: { color: Colors.light.text, fontSize: 16 },
    // New styles for the collapsible component
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    setsContainer: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.light.secondary,
        paddingTop: 5,
    },
});