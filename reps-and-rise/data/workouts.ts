import {supabase } from '../lib/supabase';

const WORKOUT_SELECT = `
    id,
    user_xid,
    exercise_xid,
    activity_xid,
    set_num,
    reps,
    weight,
    performed_on,
    created_at,
    exercises (name, id),
    activities (activity_name, id)
`;

// Gets the raw workout data for the current user, including activity details via a join
export async function getWorkouts() {
    const {
        data: {user},
        error: useError,
    } = await supabase.auth.getUser();

    if (useError) throw useError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('workout_history')
        .select(WORKOUT_SELECT)
        .eq('user_xid', user.id);

    if (!error) {
        return data;
    }

    // Fallback when performed_on is not yet migrated.
    const { data: withoutPerformedOn, error: withoutPerformedOnError } = await supabase
        .from('workout_history')
        .select(`
            id,
            user_xid,
            exercise_xid,
            activity_xid,
            set_num,
            reps,
            weight,
            created_at,
            exercises (name, id),
            activities (activity_name, id)`)
        .eq('user_xid', user.id);

    if (!withoutPerformedOnError) {
        return withoutPerformedOn;
    }

    // Fallback for legacy schema where exercise_xid/exercises relation doesn't exist yet.
    const { data: legacyData, error: legacyError } = await supabase
        .from('workout_history')
        .select(`
            id,
            user_xid,
            activity_xid,
            set_num,
            reps,
            weight,
            created_at,
            activities (activity_name, id)`)
        .eq('user_xid', user.id);

    if (legacyError) throw legacyError;
    return legacyData;
}

// Adds a new workout entry to the database
export async function addWorkout(workout) {
    const { data, error } = await supabase
        .from('workout_history')
        .insert(workout)
        .select(WORKOUT_SELECT)
        .single();

    if (!error) return data;

    // Backward compatibility when performed_on does not exist yet.
    if (error.code === '42703' && Object.prototype.hasOwnProperty.call(workout, 'performed_on')) {
        const { performed_on, ...legacyWorkout } = workout;
        const { data: legacyData, error: legacyError } = await supabase
            .from('workout_history')
            .insert(legacyWorkout)
            .select(WORKOUT_SELECT.replace(/,\s*performed_on/, ''))
            .single();

        if (legacyError) throw legacyError;
        return legacyData;
    }

    throw error;
}

// Updates an existing workout entry in the database
export async function updateWorkout(workoutId, updates) {
    const { data, error } = await supabase
        .from('workout_history')
        .update(updates)
        .eq('id', workoutId)
        .select(WORKOUT_SELECT)
        .single();

    if (!error) return data;

    // Backward compatibility when performed_on does not exist yet.
    if (error.code === '42703') {
        const { data: legacyData, error: legacyError } = await supabase
            .from('workout_history')
            .update(updates)
            .eq('id', workoutId)
            .select(WORKOUT_SELECT.replace(/,\s*performed_on/, ''))
            .single();

        if (legacyError) throw legacyError;
        return legacyData;
    }

    throw error;
}