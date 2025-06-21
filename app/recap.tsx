import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { ExerciseLog } from '@/context/WorkoutContext';
import WorkoutHeatmap from '@/components/WorkoutHeatmap';
import StyledButton from '@/components/StyledButton';

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

        <WorkoutHeatmap exercises={log} />

        {log.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}><Text style={styles.setText}>Set {setIndex + 1}</Text><Text style={styles.setText}>{set.reps} reps</Text><Text style={styles.setText}>@ RPE {set.rpe}</Text></View>
            ))}
          </View>
        ))}

        {/* THE FIX IS HERE: Changed to router.back() to simply dismiss the modal. */}
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
    exerciseName: { color: Colors.light.primary, fontSize: 22, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: Colors.light.secondary, paddingBottom: 10 },
    setRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    setText: { color: Colors.light.text, fontSize: 16 },
});
