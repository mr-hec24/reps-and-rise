import { create } from 'zustand';
import { getWorkouts, addWorkout, updateWorkout } from '@/data/workouts';
import { supabase } from '@/lib/supabase';

export interface WorkoutItem {
    id: string;
    user_xid?: string;
    exercise_xid?: string;
    activity_xid?: string;
    set_num?: number;
    reps?: number | null;
    weight?: number | null;
    performed_on?: string;
    created_at?: string;
    exercises?: { id: string; name: string };
    activities?: { id: string; activity_name: string };
}

export interface WorkoutStore {
    workouts: WorkoutItem[];
    loading: boolean;
    fetchWorkouts: () => Promise<void>;
    addWorkout: (workout: Partial<WorkoutItem>) => Promise<void>;
    updateWorkout: (workoutId: string, updates: Partial<WorkoutItem>) => Promise<void>;
    deleteWorkout: (workoutId: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
    workouts: [],
    loading: false,

    fetchWorkouts: async () => {
        set({ loading: true });
        try {
            const workouts = await getWorkouts() as WorkoutItem[];
            set({ workouts });
        } finally {
            set({ loading: false });
        }
    },

    addWorkout: async (workout) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        const finalizedWorkout = { ...workout, user_xid: user.id };
        const newWorkout = await addWorkout(finalizedWorkout) as WorkoutItem;
        set((state) => ({ workouts: [newWorkout, ...state.workouts] }));
    },

    updateWorkout: async (workoutId, updates) => {
        const updatedWorkout = await updateWorkout(workoutId, updates) as WorkoutItem;
        set((state) => ({
            workouts: state.workouts.map(w => w.id === workoutId ? updatedWorkout : w)
        }));
    },

    deleteWorkout: async (workoutId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
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