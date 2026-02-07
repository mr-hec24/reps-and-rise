import { create } from 'zustand';
import { getWorkouts } from '@/data/workouts';

export const useWorkoutStore = create((set) => ({
    workouts: [], 
    loading: false,

    fetchWorkouts: async () => {
        set({ loading: true });
        try {
            const workouts = await getWorkouts();
            set({ workouts });
        } finally {
            set({ loading: false });
        }
    },
}));