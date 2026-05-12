export const mockUser = {
  id: 1,
  name: 'Alex',
  email: 'alex@example.com',
  goalCalories: 2100,
  goalProtein: 150,
  goalCarbs: 200,
  goalFat: 70
};

export const mockMeals = [
  { id: 1, name: 'Oatmeal & Berries', calories: 350, protein: 12, carbs: 60, fat: 6, date: new Date(new Date().setHours(8, 0, 0, 0)).toISOString() },
  { id: 2, name: 'Chicken Salad', calories: 450, protein: 40, carbs: 15, fat: 20, date: new Date(new Date().setHours(13, 0, 0, 0)).toISOString() },
  { id: 3, name: 'Protein Shake', calories: 200, protein: 30, carbs: 10, fat: 4, date: new Date(new Date().setHours(16, 0, 0, 0)).toISOString() },
  { id: 4, name: 'Salmon & Quinoa', calories: 600, protein: 45, carbs: 50, fat: 25, date: new Date(new Date().setHours(19, 0, 0, 0)).toISOString() }
];

export const mockWorkouts = [
  { id: 1, type: 'Strength', duration: 60, caloriesBurned: 300, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), notes: 'Chest & Triceps' },
  { id: 2, type: 'Cardio', duration: 45, caloriesBurned: 450, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), notes: 'Running on treadmill' },
  { id: 3, type: 'Strength', duration: 75, caloriesBurned: 400, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), notes: 'Back & Biceps' },
];

export const mockProgress = [
  { date: '2023-10-01', weight: 80, bodyFat: 18 },
  { date: '2023-10-08', weight: 79.5, bodyFat: 17.8 },
  { date: '2023-10-15', weight: 79, bodyFat: 17.5 },
  { date: '2023-10-22', weight: 78.2, bodyFat: 17.2 },
  { date: '2023-10-27', weight: 77.8, bodyFat: 17.0 },
];
