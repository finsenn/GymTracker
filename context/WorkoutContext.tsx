import React, { createContext, ReactNode, useContext, useState } from 'react';

// THE FIX IS HERE: Added 'weight' to the SetLog interface
export interface SetLog { reps: number; rpe: number; weight: number; }
export interface ExerciseLog { name: string; sets: SetLog[]; workTime: number; restTime: number; }
export interface Workout { date: string; title: string; totalTime: number; exercises: ExerciseLog[]; }

interface WorkoutContextType {
  history: Workout[];
  addWorkoutToHistory: (workout: Workout) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<Workout[]>([]);

  const addWorkoutToHistory = (workout: Workout) => {
    setHistory(prevHistory => [workout, ...prevHistory]);
  };

  return (
    <WorkoutContext.Provider value={{ history, addWorkoutToHistory }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkoutHistory = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkoutHistory must be used within a WorkoutProvider');
  }
  return context;
};
