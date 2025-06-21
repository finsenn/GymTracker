// Maps exercises to their primary muscle group for the heatmap feature.

export const MUSCLE_GROUPS: Record<string, string> = {
  // PUSH
  'Bench Press': 'chest',
  'Overhead Press': 'shoulders',
  'Incline Dumbbell Press': 'chest',
  'Triceps Pushdown': 'triceps',
  'Lateral Raises': 'shoulders',
  'Chest Fly': 'chest',
  'Dips': 'triceps',
  'Skull Crushers': 'triceps',

  // PULL
  'Deadlift': 'back',
  'Pull-ups': 'back',
  'Bent Over Row': 'back',
  'Face Pulls': 'shoulders',
  'Bicep Curls': 'biceps',
  'Lat Pulldowns': 'back',
  'T-Bar Row': 'back',
  'Hammer Curls': 'biceps',
  'Preacher Curls': 'biceps',

  // LEGS
  'Squat': 'quads',
  'Romanian Deadlift': 'hamstrings',
  'Leg Press': 'quads',
  'Leg Curls': 'hamstrings',
  'Calf Raises': 'calves',
  'Lunges': 'quads',
  'Glute Bridges': 'glutes',
};
