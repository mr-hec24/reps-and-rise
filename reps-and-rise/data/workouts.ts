import {supabase } from '../lib/supabase';

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