import { create } from 'zustand';
import { getWorkouts, addWorkout, updateWorkout } from '@/data/workouts';
import { supabase } from '@/lib/supabase';

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

    addWorkout: async (workout) => {
        const {data: { user }} = await supabase.auth.getUser();
        const finalizedWorkout = { ...workout, user_xid: user.id };
        const newWorkout = await addWorkout(finalizedWorkout);
        set((state) => ({ workouts: [newWorkout, ...state.workouts]}));
    },

    updateWorkout: async (workoutId, updates) => {
        const updatedWorkout = await updateWorkout(workoutId, updates);
        set((state) => ({
            workouts: state.workouts.map(w => w.id === workoutId ? updatedWorkout : w)
        }));
    },

    deleteWorkout: async (workoutId) => {
        const {data: {user }} = await supabase.auth.getUser();
        const { error } = await supabase
            .from('workout_history')
            .delete()
            .eq('id', workoutId)
            .eq('user_xid', user.id); // Ensure user can only delete their own workouts

        if (error) throw error;

        set((state) => ({
            workouts: state.workouts.filter(w => w.id !== workoutId)
        }));
    }
}));