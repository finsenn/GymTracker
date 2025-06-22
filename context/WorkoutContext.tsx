import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of our log data
export interface SetLog { reps: number; rpe: number }
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
