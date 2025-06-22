import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Platform, Animated, Dimensions } from 'react-native';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { WORKOUTS } from '@/constants/Workouts';
import SliderInput from '@/components/SliderInput';
import LiveLog from '@/components/LiveLog';
import { useWorkoutHistory, ExerciseLog, SetLog } from '@/context/WorkoutContext';

type ScreenState = 'dayType' | 'subCategory' | 'exerciseList' | 'ready' | 'working' | 'resting';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StartWorkoutModal() {
  const [screenState, setScreenState] = useState<ScreenState>('dayType');
  const { addWorkoutToHistory } = useWorkoutHistory();
  const navigation = useNavigation();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [dayCategory, setDayCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [currentExercise, setCurrentExercise] = useState('');
  const [workoutLog, setWorkoutLog] = useState<Record<string, ExerciseLog>>({});
  const [isLoggingModalVisible, setIsLoggingModalVisible] = useState(false);
  const [tempReps, setTempReps] = useState(8);
  const [tempRpe, setTempRpe] = useState(8);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [workTimer, setWorkTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(180);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerShakeAnimation = (intensity: 'light' | 'heavy' = 'light') => {
    shakeAnimation.setValue(0);
    const distance = intensity === 'heavy' ? 10 : 5;
    const duration = intensity === 'heavy' ? 60 : 50;
    
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: distance, duration, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -distance, duration, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: distance, duration, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration, useNativeDriver: true }),
    ]).start();
  };

  // *** THE FIX IS HERE ***
  // useFocusEffect runs when the screen comes into view, ensuring navigation is ready.
  useFocusEffect(
    useCallback(() => {
      const isSelectionState = ['dayType', 'subCategory', 'exerciseList'].includes(screenState);
      navigation.setOptions({ gestureEnabled: isSelectionState });
    }, [screenState, navigation])
  );

  useEffect(() => {
    if (!sessionActive) { if (intervalRef.current) clearInterval(intervalRef.current); return; };
    intervalRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        if (screenState === 'working') setWorkTimer(prev => prev + 1);
        else if (screenState === 'resting') {
            setRestTimer(prev => {
                if (prev > 0) return prev - 1;
                if (sessionTimer % 5 === 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                return 0;
            });
        }
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) };
  }, [sessionActive, screenState, sessionTimer]);

  const selectAndGoTo = (nextState: ScreenState) => (value: string) => {
    if (dayCategory === '') setDayCategory(value); else setSubCategory(value);
    setScreenState(nextState);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExerciseSelect = (exercise: string) => {
    setCurrentExercise(exercise); setScreenState('ready'); setWorkTimer(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleWorkPress = async () => {
    if (!sessionActive) setSessionActive(true);
    const currentLog = workoutLog[currentExercise] || { name: currentExercise, sets: [], workTime: 0, restTime: 0 };
    const restTimeTaken = screenState === 'resting' ? 180 - restTimer : 0;
    setWorkoutLog({ ...workoutLog, [currentExercise]: { ...currentLog, restTime: (currentLog.restTime || 0) + restTimeTaken }});
    setScreenState('working'); setWorkTimer(0); setRestTimer(180);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    triggerShakeAnimation('heavy');
  };

  const handleRestPress = async () => {
    setIsLoggingModalVisible(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 50);
    triggerShakeAnimation('light');
  };
  
  const handleLogSet = () => {
    const newSet: SetLog = { reps: tempReps, rpe: tempRpe };
    const currentLog = workoutLog[currentExercise] || { name: currentExercise, sets: [], workTime: 0, restTime: 0 };
    setWorkoutLog({ ...workoutLog, [currentExercise]: { ...currentLog, sets: [...currentLog.sets, newSet], workTime: currentLog.workTime + workTimer }});
    setIsLoggingModalVisible(false); setScreenState('resting');
    setTempReps(8); setTempRpe(8);
  };
  
  const handleFinishWorkout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const finalLog = Object.values(workoutLog);
    if(finalLog.length > 0) {
        const dateString = new Date().toISOString().split('T')[0];
        const workoutTitle = subCategory || dayCategory || 'Workout';
        addWorkoutToHistory({ date: dateString, title: workoutTitle, totalTime: sessionTimer, exercises: finalLog });
    }
    router.replace({ pathname: '/recap', params: { log: JSON.stringify(finalLog), totalTime: sessionTimer, date: new Date().toISOString().split('T')[0] } });
  };

  const getWorkoutList = () => {
    if (dayCategory === 'fullbody') return [...WORKOUTS.upper, ...WORKOUTS.lower];
    const key = subCategory.toLowerCase() as keyof typeof WORKOUTS;
    if ((dayCategory === 'bro' || dayCategory === 'ppl') && key === 'legs') return WORKOUTS.legs;
    return WORKOUTS[key] || [];
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  
  const animatedButtonStyle = { transform: [{ translateX: shakeAnimation }] };
  const isSelectionState = ['dayType', 'subCategory', 'exerciseList'].includes(screenState);
  
  const renderContent = () => {
    if (isSelectionState) {
      if (screenState === 'dayType') {
        return ( <ScrollView contentContainerStyle={styles.scrollContainer}><Text style={styles.title}>What day is it?</Text><TouchableOpacity style={styles.choiceButton} onPress={() => selectAndGoTo('subCategory')('ppl')}><Text style={styles.choiceText}>PPL</Text></TouchableOpacity><TouchableOpacity style={styles.choiceButton} onPress={() => selectAndGoTo('subCategory')('upperlower')}><Text style={styles.choiceText}>Upper / Lower</Text></TouchableOpacity><TouchableOpacity style={styles.choiceButton} onPress={() => selectAndGoTo('exerciseList')('fullbody')}><Text style={styles.choiceText}>Full Body</Text></TouchableOpacity><TouchableOpacity style={styles.choiceButton} onPress={() => selectAndGoTo('subCategory')('bro')}><Text style={styles.choiceText}>Bro Split</Text></TouchableOpacity></ScrollView> );
      }
      if (screenState === 'subCategory') {
        const categories = { ppl: ['Push', 'Pull', 'Legs'], upperlower: ['Upper', 'Lower'], bro: ['Chest', 'Back', 'Arms', 'Legs'] }[dayCategory] || [];
        return ( <ScrollView contentContainerStyle={styles.scrollContainer}><Text style={styles.title}>{dayCategory.toUpperCase()}</Text>{categories.map(cat => (<TouchableOpacity key={cat} style={styles.choiceButton} onPress={() => selectAndGoTo('exerciseList')(cat)}><Text style={styles.choiceText}>{cat}</Text></TouchableOpacity>))}</ScrollView> );
      }
      if (screenState === 'exerciseList') {
        return ( <View style={{flex: 1}}><Text style={styles.title}>Choose your poison</Text><ScrollView contentContainerStyle={styles.scrollContainer}>{getWorkoutList().map(ex => (<TouchableOpacity key={ex} style={styles.choiceButton} onPress={() => handleExerciseSelect(ex)}><Text style={styles.choiceText}>{ex}</Text></TouchableOpacity>))}</ScrollView></View> );
      }
    } else {
      return (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ flex: 1 }} scrollEnabled={screenState !== 'ready'}>
          <View style={styles.page}>
            {screenState === 'ready' && (<View style={styles.centerContainer}><Text style={styles.sessionTimerText}>Session Paused</Text><Text style={styles.exerciseText}>{currentExercise}</Text><Animated.View style={animatedButtonStyle}><TouchableOpacity style={styles.mainActionButton} onPress={handleWorkPress}><Text style={styles.mainActionButtonText}>WORK</Text></TouchableOpacity></Animated.View><TouchableOpacity onPress={() => setScreenState('exerciseList')}><Text style={styles.linkText}>Change Workout</Text></TouchableOpacity><View style={styles.finishButtonContainer}><TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}><Text style={styles.finishButtonText}>FINISH</Text></TouchableOpacity></View></View>)}
            {screenState === 'working' && (<View style={styles.centerContainer}><Text style={styles.sessionTimerText}>Session: {formatTime(sessionTimer)}</Text><Text style={styles.exerciseText}>{currentExercise}</Text><Text style={styles.workTimerText}>Working: {formatTime(workTimer)}</Text><Animated.View style={animatedButtonStyle}><TouchableOpacity style={styles.mainActionButtonRest} onPress={handleRestPress}><Text style={styles.mainActionButtonText}>REST</Text></TouchableOpacity></Animated.View><Text style={styles.swipeHint}>Swipe for Log &gt;</Text><View style={styles.finishButtonContainer}><TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}><Text style={styles.finishButtonText}>FINISH</Text></TouchableOpacity></View></View>)}
            {screenState === 'resting' && (<View style={styles.centerContainer}><Text style={styles.sessionTimerText}>Session: {formatTime(sessionTimer)}</Text><Text style={[styles.timerLabel, restTimer === 0 && { color: Colors.light.warning }]}>{restTimer === 0 ? "REST OVERTIME" : "RESTING"}</Text><Text style={[styles.timer, restTimer === 0 && { color: Colors.light.warning }]}>{formatTime(restTimer)}</Text><Animated.View style={animatedButtonStyle}><TouchableOpacity style={styles.mainActionButton} onPress={handleWorkPress}><Text style={styles.mainActionButtonText}>WORK</Text></TouchableOpacity></Animated.View><TouchableOpacity onPress={() => setScreenState('exerciseList')}><Text style={styles.linkText}>Change Workout</Text></TouchableOpacity><Text style={styles.swipeHint}>Swipe for Log &gt;</Text><View style={styles.finishButtonContainer}><TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}><Text style={styles.finishButtonText}>FINISH</Text></TouchableOpacity></View></View>)}
          </View>
          <View style={styles.page}><LiveLog log={workoutLog} /></View>
        </ScrollView>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {isSelectionState && (<TouchableOpacity onPress={() => router.back()}><FontAwesome name="close" size={24} color={Colors.light.text} /></TouchableOpacity>)}
      </View>
      <Modal visible={isLoggingModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}><View style={styles.modalView}><Text style={styles.modalTitle}>Log Your Set</Text><SliderInput label="Reps" min={1} max={30} step={1} value={tempReps} onValueChange={setTempReps} /><SliderInput label="RPE" min={1} max={10} step={0.5} value={tempRpe} onValueChange={setTempRpe} /><TouchableOpacity style={styles.logSetButton} onPress={handleLogSet}><Text style={styles.logSetButtonText}>LOG IT</Text></TouchableOpacity></View></View>
      </Modal>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, paddingTop: Platform.OS === 'android' ? 25 : 0 },
  page: { width: SCREEN_WIDTH },
  header: { height: 50, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20 },
  scrollContainer: { paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.light.text, textAlign: 'center', marginVertical: 20 },
  choiceButton: { backgroundColor: Colors.light.card, paddingVertical: 20, borderRadius: 10, marginBottom: 15 },
  choiceText: { color: Colors.light.text, fontSize: 20, textAlign: 'center', fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sessionTimerText: { color: Colors.light.subtitle, fontSize: 20, position: 'absolute', top: 20 },
  exerciseText: { color: Colors.light.text, fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  workTimerText: { color: Colors.light.subtitle, fontSize: 18, marginBottom: 20 },
  mainActionButton: { width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.light.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  mainActionButtonRest: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  mainActionButtonText: { color: Colors.light.text, fontSize: 48, fontWeight: 'bold' },
  linkText: { color: Colors.light.tint, fontSize: 16 },
  finishButtonContainer: { position: 'absolute', bottom: 40 },
  finishButton: { backgroundColor: Colors.light.secondary, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
  finishButtonText: { color: Colors.light.text, fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalView: { margin: 20, backgroundColor: Colors.light.card, borderRadius: 20, padding: 35, alignItems: 'center', width: '90%' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.light.text, marginBottom: 20 },
  logSetButton: { backgroundColor: Colors.light.primary, borderRadius: 10, padding: 15, marginTop: 20, width: '100%' },
  logSetButtonText: { color: Colors.light.text, fontWeight: 'bold', textAlign: 'center', fontSize: 18 },
  timerLabel: { color: Colors.light.subtitle, fontSize: 20, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  timer: { color: Colors.light.text, fontSize: 72, fontWeight: 'bold', marginBottom: 40, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  swipeHint: { color: Colors.light.subtitle, fontSize: 14, position: 'absolute', bottom: 100, },
});
