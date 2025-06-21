import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Colors from '@/constants/Colors';
import { useWorkoutHistory } from '@/context/WorkoutContext';

export default function HomeScreen() {
  const { history } = useWorkoutHistory();

  const markedDates = useMemo(() => {
    const dates: { [key: string]: object } = {};
    const todayString = new Date().toISOString().split('T')[0];

    // First, mark all workout days with a solid red background.
    history.forEach(workout => {
      const dateString = workout.date;
      dates[dateString] = {
        selected: true,
        selectedColor: Colors.light.primary,
        disableTouchEvent: true,
      };
    });

    // *** THE FIX IS HERE ***
    // Now, we specifically handle today's date to distinguish it.
    const todayHasWorkout = !!dates[todayString];

    if (todayHasWorkout) {
      // If today has a workout, add a white dot to the existing red circle.
      dates[todayString] = {
        ...dates[todayString],
        marked: true,
        dotColor: 'white',
      };
    } 
    // The `todayTextColor` from the theme will handle the case where
    // today has no workout, coloring the number red.

    return dates;
  }, [history]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Consistency</Text>
      <View style={styles.calendarContainer}>
        <Calendar
          current={new Date().toISOString().split('T')[0]}
          markedDates={markedDates}
          // The theme ensures the current day's TEXT is red,
          // while workout days get a solid red BACKGROUND.
          theme={{
            backgroundColor: Colors.light.background,
            calendarBackground: Colors.light.background,
            textSectionTitleColor: Colors.light.subtitle,
            selectedDayBackgroundColor: Colors.light.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: Colors.light.primary, // This colors the current day's number
            dayTextColor: Colors.light.text,
            textDisabledColor: Colors.light.secondary,
            dotColor: 'white', // Default dot color
            selectedDotColor: 'white',
            arrowColor: Colors.light.primary,
            monthTextColor: Colors.light.text,
            indicatorColor: 'blue',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 16,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  calendarContainer: {
    marginHorizontal: 10,
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    paddingVertical: 10,
  }
});
