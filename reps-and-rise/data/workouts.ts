import {supabase } from '../lib/supabase';

// Gets the raw workout data for the current user, including activity details via a join
export async function getWorkouts() {
    const {
        data: {user},
        error: useError,
    } = await supabase.auth.getUser();

    // console.log("Workout query result:", user.id);

    if (useError) throw useError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('workout_history')
        .select(`
            id,
            user_xid,
            activity_xid,
            start_time,
            set,
            reps,
            weight,
            created_at,
            activities (activity_name, id)`)
        .eq('user_xid', user.id); // filter by owner
        // .order('created_at', { ascending: false });

    console.log("Workout query result:", JSON.stringify(data, null, 2));
    
    if (error) throw error;
    
    return data;
}

// Adds a new workout entry to the database
export async function addWorkout(workout) {
    const { data, error } = await supabase
    .from('workout_history')
    .insert(workout)
    .select()
    .single();

    if (error) throw error;
    return data;
}

// Updates an existing workout entry in the database
export async function updateWorkout(workoutId, updates) {
    const { data, error } = await supabase
    .from('workout_history')
    .update(updates)
    .eq('id', workoutId)
    .select()
    .single();

    if (error) throw error;
    return data;
}